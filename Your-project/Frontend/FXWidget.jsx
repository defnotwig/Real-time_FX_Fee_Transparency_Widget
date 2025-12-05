import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowRight, ArrowDown, Info, Sun, Moon, ChevronDown, ChevronUp, TrendingDown, Check, AlertCircle, RefreshCw, Zap, Shield } from 'lucide-react';

// ============================================================================
// RIPE FX WIDGET - Real-Time FX & Fee Transparency
// ============================================================================
// 
// FONT REQUIREMENT: This widget is designed to use the "Inter" font family.
// Add this to your HTML head for optimal appearance:
//   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
//
// TAILWIND CONFIG: Extend your fontFamily with:
//   fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] }
//
// ============================================================================

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Default/fallback FX Rates Configuration (used when API is unavailable)
 * - interbank: True mid-market rate (best possible)
 * - customer: Ripe's customer rate (includes small spread)
 * - flag: Emoji flag for visual identification
 */
const DEFAULT_FX_RATES = {
  PHP: { interbank: 59.0, customer: 58.5, symbol: '₱', name: 'Philippine Peso', decimals: 2, flag: '🇵🇭' },
  THB: { interbank: 35.5, customer: 35.2, symbol: '฿', name: 'Thai Baht', decimals: 2, flag: '🇹🇭' },
  IDR: { interbank: 15800, customer: 15650, symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, flag: '🇮🇩' },
  MYR: { interbank: 4.65, customer: 4.60, symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, flag: '🇲🇾' }
};

// Live FX rates - will be updated from API
let FX_RATES = { ...DEFAULT_FX_RATES };

// Currency metadata (symbols, decimals, flags)
const CURRENCY_META = {
  PHP: { symbol: '₱', name: 'Philippine Peso', decimals: 2, flag: '🇵🇭' },
  THB: { symbol: '฿', name: 'Thai Baht', decimals: 2, flag: '🇹🇭' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, flag: '🇮🇩' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, flag: '🇲🇾' },
};

/**
 * Ripe Fee Structure (Transparent & Competitive)
 */
const FEES = {
  transactionFeePercent: 0.5,  // 0.5% of transaction amount
  networkFeeUSD: 0.50,         // Reduced - modern stablecoin transfers are cheap
  minimumFee: 0.10             // Minimum transaction fee in USDC
};

/**
 * Legacy Provider Fees (For Comparison)
 */
const LEGACY_FEES = {
  transactionFeePercent: 3.0,  // 3% - 6x higher than Ripe
  networkFeeUSD: 5.0,          // $5 - 2.5x higher than Ripe
  fxSpreadPercent: 2.5         // Hidden 2.5% spread
};

/**
 * Preset Amount Buttons
 */
const PRESET_AMOUNTS = [10, 50, 100, 500, 1000];

/**
 * Supported Stablecoins (per Ripe's partnerships with Tether, Circle, and Paxos)
 * - USDC: Circle's regulated stablecoin
 * - USDT: Tether - world's largest stablecoin (official Ripe partnership)
 * - USDG: Global Dollar by Paxos Digital Singapore
 */
const STABLECOINS = {
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    color: "#2775CA",
    description: "Circle's regulated stablecoin",
    icon: "$",
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    color: "#26A17B",
    description: "World's largest stablecoin",
    icon: "₮",
  },
  USDG: {
    name: "Global Dollar",
    symbol: "USDG",
    color: "#6366F1",
    description: "Paxos-issued stablecoin",
    icon: "G",
  },
};

/**
 * Input validation limits
 */
const INPUT_LIMITS = {
  maxAmount: 1000000,    // 1 million USDC cap
  minAmount: 0.01,       // Minimum viable amount
  maxDecimals: 2         // Cap decimals to 2
};

// ============================================================================
// REAL-TIME FX RATES HOOK (Multiple API Sources)
// ============================================================================

/**
 * API configuration for live exchange rates
 */
const FX_API_CONFIG = {
  // Primary: CoinGecko API (free tier, no API key required)
  coingecko: {
    stablecoinUrl: "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,tether&vs_currencies=php,thb,idr,myr,usd",
    coinIds: {
      USDC: "usd-coin",
      USDT: "tether",
    },
    parser: (data) => {
      const result = { stablecoins: {}, fiatRates: {} };
      
      if (data["usd-coin"]) {
        result.stablecoins.USDC = {
          PHP: data["usd-coin"].php,
          THB: data["usd-coin"].thb,
          IDR: data["usd-coin"].idr,
          MYR: data["usd-coin"].myr,
          USD: data["usd-coin"].usd || 1.0,
        };
      }
      if (data["tether"]) {
        result.stablecoins.USDT = {
          PHP: data["tether"].php,
          THB: data["tether"].thb,
          IDR: data["tether"].idr,
          MYR: data["tether"].myr,
          USD: data["tether"].usd || 1.0,
        };
      }
      
      // USDG uses USDC rate as proxy
      result.stablecoins.USDG = result.stablecoins.USDC;
      
      const usdcPrices = result.stablecoins.USDC || result.stablecoins.USDT;
      if (usdcPrices && usdcPrices.PHP) {
        result.fiatRates = {
          PHP: usdcPrices.PHP,
          THB: usdcPrices.THB,
          IDR: usdcPrices.IDR,
          MYR: usdcPrices.MYR,
        };
      }
      
      return result;
    },
  },
  // Fallback 1: ExchangeRate-API
  fallback: {
    url: "https://api.exchangerate-api.com/v4/latest/USD",
    parser: (data) => ({
      PHP: data.rates?.PHP,
      THB: data.rates?.THB,
      IDR: data.rates?.IDR,
      MYR: data.rates?.MYR,
    }),
  },
  // Fallback 2: Open Exchange Rates
  fallback2: {
    url: "https://open.er-api.com/v6/latest/USD",
    parser: (data) => ({
      PHP: data.rates?.PHP,
      THB: data.rates?.THB,
      IDR: data.rates?.IDR,
      MYR: data.rates?.MYR,
    }),
  },
  // Fallback 3: Frankfurter
  fallback3: {
    url: "https://api.frankfurter.app/latest?from=USD&to=PHP,THB,IDR,MYR",
    parser: (data) => ({
      PHP: data.rates?.PHP,
      THB: data.rates?.THB,
      IDR: data.rates?.IDR,
      MYR: data.rates?.MYR,
    }),
  },
  refreshInterval: 120000, // 2 minutes
  staleThreshold: 600000,  // 10 minutes
};

// Stablecoin-specific rates (live data)
let STABLECOIN_RATES = {
  USDC: { PHP: 59.0, THB: 35.5, IDR: 16700, MYR: 4.65, USD: 1.0 },
  USDT: { PHP: 59.0, THB: 35.5, IDR: 16700, MYR: 4.65, USD: 1.0 },
  USDG: { PHP: 59.0, THB: 35.5, IDR: 16700, MYR: 4.65, USD: 1.0 },
};

/**
 * Custom hook for fetching and managing live exchange rates with multiple fallbacks
 */
const useLiveRates = () => {
  const [rates, setRates] = useState(DEFAULT_FX_RATES);
  const [stablecoinRates, setStablecoinRates] = useState(STABLECOIN_RATES);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("fallback");

  // Helper to update rates from fiat data
  const updateFromFiatRates = useCallback((parsedRates, sourceName) => {
    const isValid = parsedRates.PHP && parsedRates.THB && parsedRates.IDR && parsedRates.MYR;
    if (!isValid) return false;

    const updatedRates = {};
    Object.keys(CURRENCY_META).forEach((currency) => {
      const interbankRate = parsedRates[currency];
      const customerSpread = 0.003; // 0.3% spread - Ripe's competitive advantage
      updatedRates[currency] = {
        ...CURRENCY_META[currency],
        interbank: interbankRate,
        customer: interbankRate * (1 - customerSpread),
      };
    });

    const newStablecoinRates = {
      USDC: { PHP: parsedRates.PHP, THB: parsedRates.THB, IDR: parsedRates.IDR, MYR: parsedRates.MYR, USD: 1.0 },
      USDT: { PHP: parsedRates.PHP, THB: parsedRates.THB, IDR: parsedRates.IDR, MYR: parsedRates.MYR, USD: 1.0 },
      USDG: { PHP: parsedRates.PHP, THB: parsedRates.THB, IDR: parsedRates.IDR, MYR: parsedRates.MYR, USD: 1.0 },
    };

    FX_RATES = updatedRates;
    STABLECOIN_RATES = newStablecoinRates;
    setRates(updatedRates);
    setStablecoinRates(newStablecoinRates);
    setLastUpdated(new Date());
    setSource(sourceName);
    console.log(`✅ Rates updated from ${sourceName}:`, updatedRates);
    return true;
  }, []);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Try CoinGecko first
    try {
      console.log("🔄 Trying CoinGecko API...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(FX_API_CONFIG.coingecko.stablecoinUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);

      const data = await response.json();
      console.log("📊 CoinGecko response:", data);

      const parsed = FX_API_CONFIG.coingecko.parser(data);
      
      if (parsed.fiatRates && parsed.fiatRates.PHP) {
        STABLECOIN_RATES = parsed.stablecoins;
        setStablecoinRates(parsed.stablecoins);
        
        if (updateFromFiatRates(parsed.fiatRates, "coingecko")) {
          setIsLoading(false);
          return;
        }
      }
      throw new Error("Invalid CoinGecko data");
    } catch (e) {
      console.warn("⚠️ CoinGecko failed:", e.message);
    }

    // Try ExchangeRate-API
    try {
      console.log("🔄 Trying ExchangeRate-API...");
      const response = await fetch(FX_API_CONFIG.fallback.url);
      if (response.ok) {
        const data = await response.json();
        const parsed = FX_API_CONFIG.fallback.parser(data);
        if (updateFromFiatRates(parsed, "exchangerate-api")) {
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("⚠️ ExchangeRate-API failed:", e.message);
    }

    // Try Open ER API
    try {
      console.log("🔄 Trying Open.er-api...");
      const response = await fetch(FX_API_CONFIG.fallback2.url);
      if (response.ok) {
        const data = await response.json();
        const parsed = FX_API_CONFIG.fallback2.parser(data);
        if (updateFromFiatRates(parsed, "open-er-api")) {
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("⚠️ Open.er-api failed:", e.message);
    }

    // Try Frankfurter
    try {
      console.log("🔄 Trying Frankfurter API...");
      const response = await fetch(FX_API_CONFIG.fallback3.url);
      if (response.ok) {
        const data = await response.json();
        const parsed = FX_API_CONFIG.fallback3.parser(data);
        if (updateFromFiatRates(parsed, "frankfurter")) {
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("⚠️ Frankfurter failed:", e.message);
    }

    // All APIs failed
    console.error("❌ All APIs failed, using cached rates");
    setError("Unable to fetch live rates");
    setSource("cached");
    setLastUpdated(new Date());
    setIsLoading(false);
  }, [updateFromFiatRates]);

  // Initial fetch on mount
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Auto-refresh rates every 2 minutes
  useEffect(() => {
    const intervalId = setInterval(fetchRates, FX_API_CONFIG.refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchRates]);

  // Calculate if rates are stale
  const isStale = useMemo(() => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated.getTime() > FX_API_CONFIG.staleThreshold;
  }, [lastUpdated]);

  // Format last updated time
  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return "Fetching...";
    const now = new Date();
    const diffMs = now - lastUpdated;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    return lastUpdated.toLocaleTimeString();
  }, [lastUpdated]);

  // Get rate for specific stablecoin
  const getStablecoinRate = useCallback((stablecoin, fiatCurrency) => {
    const coinRates = stablecoinRates[stablecoin];
    if (coinRates && coinRates[fiatCurrency]) {
      return coinRates[fiatCurrency];
    }
    return FX_RATES[fiatCurrency]?.customer || 1;
  }, [stablecoinRates]);

  return {
    rates,
    stablecoinRates,
    lastUpdated,
    lastUpdatedText,
    isLoading,
    isStale,
    error,
    source,
    refreshRates: fetchRates,
    getStablecoinRate,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency with proper locale and symbol
 */
const formatCurrency = (amount, currency) => {
  const config = FX_RATES[currency];
  if (!config) return amount.toFixed(2);
  
  if (!isFinite(amount) || isNaN(amount)) return `${config.symbol}0`;
  
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  });
  
  const sign = amount < 0 ? '-' : '';
  return `${sign}${config.symbol}${formatted}`;
};

/**
 * Format USDC amounts with consistent 2 decimal places
 */
const formatUSDC = (amount) => {
  if (!isFinite(amount) || isNaN(amount)) return '0.00';
  return Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Validate and sanitize input amount
 */
const validateAmount = (value) => {
  if (value === '' || value === undefined) {
    return { isValid: true, value: 0, error: null };
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, value: 0, error: 'Please enter a valid number' };
  }
  
  if (numValue < 0) {
    return { isValid: false, value: 0, error: 'Amount cannot be negative' };
  }
  
  if (numValue > INPUT_LIMITS.maxAmount) {
    return { isValid: false, value: INPUT_LIMITS.maxAmount, error: `Maximum: ${INPUT_LIMITS.maxAmount.toLocaleString()} USDC` };
  }
  
  // Cap decimals to 2
  const roundedValue = Math.round(numValue * 100) / 100;
  
  return { isValid: true, value: roundedValue, error: null };
};

/**
 * Calculate conversion with full fee breakdown (Ripe) - SEND mode
 */
const calculateConversion = (usdcAmount, currency) => {
  const rates = FX_RATES[currency];
  
  if (!rates || !isFinite(usdcAmount) || usdcAmount <= 0) {
    return null;
  }
  
  // Step 1: Gross conversion at customer rate
  const grossFiat = usdcAmount * rates.customer;
  
  // Step 2: Calculate Ripe transaction fee (0.5% with minimum)
  const transactionFee = Math.max(
    usdcAmount * (FEES.transactionFeePercent / 100),
    FEES.minimumFee
  );
  
  // Step 3: Convert network fee to target currency
  const networkFee = FEES.networkFeeUSD * rates.customer;
  
  // Step 4: Calculate FX spread (interbank vs customer rate)
  const fxSpread = usdcAmount * (rates.interbank - rates.customer);
  const fxSpreadPercent = ((rates.interbank - rates.customer) / rates.interbank) * 100;
  
  // Step 5: Net amount received
  const transactionFeeInFiat = transactionFee * rates.customer;
  const netFiatReceived = grossFiat - transactionFeeInFiat - networkFee;
  
  // Step 6: Effective rate
  const effectiveRate = usdcAmount > 0 ? netFiatReceived / usdcAmount : 0;
  
  // Total fees
  const totalFeesInFiat = transactionFeeInFiat + networkFee;
  const totalFeesPercent = usdcAmount > 0 ? (totalFeesInFiat / grossFiat) * 100 : 0;
  
  return {
    grossFiat,
    transactionFee,
    transactionFeeInFiat,
    networkFee,
    fxSpread,
    fxSpreadPercent,
    netFiatReceived,
    effectiveRate,
    totalFeesInFiat,
    totalFeesPercent,
    customerRate: rates.customer,
    interbankRate: rates.interbank
  };
};

/**
 * Calculate reverse conversion (RECEIVE mode)
 */
const calculateReverseConversion = (fiatAmount, currency) => {
  const rates = FX_RATES[currency];
  
  if (!rates || !isFinite(fiatAmount) || fiatAmount <= 0) {
    return null;
  }
  
  const networkFeeInFiat = FEES.networkFeeUSD * rates.customer;
  const feeMultiplier = 1 - (FEES.transactionFeePercent / 100);
  
  let requiredUSDC = (fiatAmount + networkFeeInFiat) / (rates.customer * feeMultiplier);
  
  const calculatedFee = requiredUSDC * (FEES.transactionFeePercent / 100);
  if (calculatedFee < FEES.minimumFee) {
    requiredUSDC = (fiatAmount + networkFeeInFiat + (FEES.minimumFee * rates.customer)) / rates.customer;
  }
  
  requiredUSDC = Math.round(requiredUSDC * 100) / 100;
  
  const forward = calculateConversion(requiredUSDC, currency);
  
  return {
    ...forward,
    requiredUSDC,
    targetFiat: fiatAmount
  };
};

/**
 * Calculate legacy provider conversion for comparison
 */
const calculateLegacyConversion = (usdcAmount, currency) => {
  const rates = FX_RATES[currency];
  
  if (!rates || !isFinite(usdcAmount) || usdcAmount <= 0) {
    return null;
  }
  
  const legacyRate = rates.interbank * (1 - LEGACY_FEES.fxSpreadPercent / 100);
  const grossFiat = usdcAmount * legacyRate;
  const transactionFee = usdcAmount * (LEGACY_FEES.transactionFeePercent / 100);
  const transactionFeeInFiat = transactionFee * legacyRate;
  const networkFee = LEGACY_FEES.networkFeeUSD * legacyRate;
  const netFiatReceived = grossFiat - transactionFeeInFiat - networkFee;
  
  return {
    netFiatReceived,
    totalFeesInFiat: transactionFeeInFiat + networkFee,
    effectiveRate: usdcAmount > 0 ? netFiatReceived / usdcAmount : 0,
    legacyRate,
    transactionFeeInFiat,
    networkFee
  };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Direction Toggle Component
 */
const DirectionToggle = ({ direction, onToggle, isDark }) => {
  const baseClass = `flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm min-h-[44px]`;
  const getActiveStyle = (isActive) => isActive ? { background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)', boxShadow: '0 4px 14px rgba(0,212,170,0.3)' } : {};
  const inactiveClass = isDark 
    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-gray-600' 
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200';
  
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Transfer direction">
      <button
        type="button"
        role="radio"
        aria-checked={direction === 'send'}
        onClick={() => onToggle('send')}
        className={`${baseClass} ${direction === 'send' ? 'text-white' : inactiveClass}`}
        style={getActiveStyle(direction === 'send')}
      >
        <Zap className="w-4 h-4" />
        I'm sending
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={direction === 'receive'}
        onClick={() => onToggle('receive')}
        className={`${baseClass} ${direction === 'receive' ? 'text-white' : inactiveClass}`}
        style={getActiveStyle(direction === 'receive')}
      >
        <ArrowDown className="w-4 h-4" />
        They receive
      </button>
    </div>
  );
};

/**
 * Currency Button Component
 */
const CurrencyButton = ({ code, config, isSelected, onClick, isDark }) => {
  const baseClass = `p-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[60px]`;
  const activeStyle = isSelected ? { background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)', boxShadow: '0 4px 14px rgba(0,212,170,0.3)' } : {};
  const inactiveClass = isDark
    ? 'bg-gray-700/50 text-gray-200 hover:bg-gray-600 border border-gray-600'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200';
  
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Select ${config.name}`}
      className={`${baseClass} ${isSelected ? 'text-white' : inactiveClass}`}
      style={activeStyle}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg">{config.flag} {config.symbol}</span>
        <span className="text-xs opacity-80">{code}</span>
      </div>
    </button>
  );
};

/**
 * Preset Button Component
 */
const PresetButton = ({ amount, isSelected, onClick, isDark }) => {
  const baseClass = `px-3 py-2.5 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm min-w-[50px] min-h-[44px]`;
  const activeStyle = isSelected ? { background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)', boxShadow: '0 4px 14px rgba(0,212,170,0.25)' } : {};
  const inactiveClass = isDark
    ? 'bg-gray-700/50 text-gray-200 hover:bg-gray-600 border border-gray-600'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200';
  
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`${baseClass} ${isSelected ? 'text-white' : inactiveClass}`}
      style={activeStyle}
    >
      {amount >= 1000 ? `${amount / 1000}K` : amount}
    </button>
  );
};

/**
 * Stablecoin Button Component
 * Allows selection between USDC, USDT, and USDG
 */
const StablecoinButton = ({ code, config, isSelected, onClick, isDark }) => {
  const baseClass = `px-3 py-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm min-h-[44px] flex items-center gap-2`;
  const activeStyle = isSelected 
    ? { background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`, boxShadow: `0 4px 14px ${config.color}40` }
    : {};
  const inactiveClass = isDark
    ? 'bg-gray-700/50 text-gray-200 hover:bg-gray-600 border border-gray-600'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200';
  
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Select ${config.name}`}
      className={`${baseClass} ${isSelected ? 'text-white' : inactiveClass}`}
      style={activeStyle}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ background: isSelected ? 'rgba(255,255,255,0.2)' : config.color }}
      >
        {config.icon}
      </span>
      <span>{code}</span>
    </button>
  );
};

/**
 * Fee Line Item Component
 */
const FeeLineItem = ({ label, value, isDeduction = false, isTotal = false, hint = null, mutedTextClass }) => {
  return (
    <div className={`flex justify-between items-center py-1 ${isTotal ? 'pt-3' : ''}`}>
      <div className="flex flex-col">
        <span className={isTotal ? 'font-bold text-base' : mutedTextClass}>
          {label}
        </span>
        {hint && <span className={`text-xs ${mutedTextClass}`}>{hint}</span>}
      </div>
      <span className={`tabular-nums font-mono ${
        isTotal 
          ? 'font-bold text-xl text-green-600' 
          : isDeduction 
            ? 'font-semibold text-red-500' 
            : 'font-semibold'
      }`}>
        {isDeduction && !isTotal ? '−' : ''}{value}
      </span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FXWidget - Real-Time FX & Fee Transparency Component
 * 
 * A self-contained, embeddable widget that displays transparent USDC → fiat
 * conversion rates with full fee breakdown. Designed for trust and clarity.
 * 
 * Ripe Brand: "From stablecoin to e-wallet" — instant settlement for 
 * Southeast Asia's freelancers, remittances, and everyday payments.
 */
const FXWidget = ({
  defaultCurrency = 'PHP',
  defaultAmount = 100,
  defaultStablecoin = 'USDC',
  theme: initialTheme = 'light',
  showComparison = true,
  showDirectionToggle = true,
  showStablecoinSelector = true,
  brandColor = '#00d4aa', // Ripe teal brand color
  onConversionComplete
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [amount, setAmount] = useState(defaultAmount);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [stablecoin, setStablecoin] = useState(defaultStablecoin);
  const [theme, setTheme] = useState(initialTheme);
  const [showDetails, setShowDetails] = useState(false);
  const [inputValue, setInputValue] = useState(defaultAmount.toString());
  const [direction, setDirection] = useState('send');
  const [inputError, setInputError] = useState(null);
  
  // Use live FX rates from CoinGecko
  const { 
    rates: liveRates, 
    stablecoinRates,
    lastUpdatedText, 
    isLoading: ratesLoading, 
    isStale, 
    error: ratesError,
    source: ratesSource,
    refreshRates,
    getStablecoinRate,
  } = useLiveRates();
  
  // ============================================================================
  // MEMOIZED CALCULATIONS
  // ============================================================================
  
  const ripeConversion = useMemo(() => {
    if (!amount || amount <= 0) return null;
    if (direction === 'receive') {
      return calculateReverseConversion(amount, currency);
    }
    return calculateConversion(amount, currency);
  }, [amount, currency, direction, liveRates, stablecoin, stablecoinRates]);
  
  const legacyConversion = useMemo(() => {
    if (!amount || amount <= 0 || !showComparison) return null;
    const usdcToCompare = direction === 'receive' && ripeConversion
      ? ripeConversion.requiredUSDC
      : amount;
    return calculateLegacyConversion(usdcToCompare, currency);
  }, [amount, currency, showComparison, direction, ripeConversion, liveRates, stablecoinRates]);
  
  const savings = useMemo(() => {
    if (!ripeConversion || !legacyConversion) return null;
    const ripeFiat = ripeConversion.netFiatReceived;
    const legacyFiat = legacyConversion.netFiatReceived;
    const savingsAmount = ripeFiat - legacyFiat;
    const savingsPercent = legacyFiat > 0 ? Math.abs((savingsAmount / legacyFiat) * 100) : 0;
    return {
      amount: savingsAmount,
      percent: savingsPercent,
      ripeBetter: savingsAmount > 0
    };
  }, [ripeConversion, legacyConversion]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleAmountChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    const validation = validateAmount(value);
    setInputError(validation.error);
    if (validation.isValid) {
      setAmount(validation.value);
    }
  }, []);
  
  const handlePresetClick = useCallback((presetAmount) => {
    setAmount(presetAmount);
    setInputValue(presetAmount.toString());
    setInputError(null);
  }, []);
  
  const handleCurrencyChange = useCallback((newCurrency) => {
    setCurrency(newCurrency);
  }, []);
  
  const handleStablecoinChange = useCallback((newStablecoin) => {
    setStablecoin(newStablecoin);
  }, []);
  
  const handleDirectionToggle = useCallback((newDirection) => {
    setDirection(newDirection);
    // Convert current value to equivalent in new direction
    if (newDirection === 'receive' && amount > 0 && ripeConversion) {
      const fiatEquivalent = Math.round(ripeConversion.netFiatReceived);
      setAmount(fiatEquivalent);
      setInputValue(fiatEquivalent.toString());
    } else if (newDirection === 'send' && amount > 0 && ripeConversion?.requiredUSDC) {
      const usdcEquivalent = ripeConversion.requiredUSDC;
      setAmount(usdcEquivalent);
      setInputValue(usdcEquivalent.toString());
    }
  }, [amount, ripeConversion]);
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);
  
  // Callback
  useEffect(() => {
    if (ripeConversion && onConversionComplete) {
      onConversionComplete({
        ...ripeConversion,
        direction,
        currency,
        stablecoin,
        inputAmount: amount
      });
    }
  }, [ripeConversion, onConversionComplete, direction, currency, stablecoin, amount]);
  
  // ============================================================================
  // THEME CLASSES
  // ============================================================================
  
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const inputBgClass = isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300';
  const focusRingClass = isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white';
  const currencyConfig = FX_RATES[currency];
  const stablecoinConfig = STABLECOINS[stablecoin];
  const inputLabel = direction === 'send' ? `You send (${stablecoin})` : `Recipient gets (${currency})`;
  const inputSuffix = direction === 'send' ? stablecoin : currency;
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div 
      className={`w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl shadow-xl ${bgClass} ${textClass} transition-colors duration-200 border ${borderClass}`}
      role="region"
      aria-label="FX Conversion Calculator"
    >
      
      {/* ========== HEADER ========== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #00d4aa, #7c3aed)' }}>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </span>
            <span style={{ background: 'linear-gradient(90deg, #00d4aa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ripe FX</span>
          </h2>
          <p className={`text-xs sm:text-sm ${mutedTextClass} mt-1`}>
            From stablecoin to e-wallet — instant settlement
          </p>
          {/* Live Rate Status Indicator */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              ratesLoading 
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : ratesError 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : isStale
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                ratesLoading 
                  ? 'bg-yellow-500 animate-pulse' 
                  : ratesError 
                    ? 'bg-red-500'
                    : isStale
                      ? 'bg-orange-500'
                      : 'bg-green-500'
              }`}></span>
              {ratesLoading ? 'Updating...' : ratesError ? 'Cached' : isStale ? 'Stale' : 'Live'}
            </div>
            {/* Source badge */}
            {!ratesLoading && !ratesError && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${mutedTextClass}`}>
                {ratesSource === 'coingecko' ? '🦎 CoinGecko' : 
                 ratesSource === 'exchangerate-api' ? '💱 ExchangeRate' : 
                 ratesSource === 'open-er-api' ? '🌐 OpenER' : 
                 ratesSource === 'frankfurter' ? '🇪🇺 Frankfurter' : '📦 Cached'}
              </span>
            )}
            <span className={`text-xs ${mutedTextClass}`}>
              {lastUpdatedText}
            </span>
            {!ratesLoading && (
              <button
                onClick={refreshRates}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${mutedTextClass}`}
                title="Refresh rates"
                aria-label="Refresh exchange rates"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl ${cardBgClass} hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 ${focusRingClass} min-w-[44px] min-h-[44px] flex items-center justify-center`}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      
      {/* ========== INPUT SECTION ========== */}
      <div className="space-y-5">
        
        {/* Direction Toggle */}
        {showDirectionToggle && (
          <DirectionToggle 
            direction={direction} 
            onToggle={handleDirectionToggle}
            isDark={isDark}
          />
        )}
        
        {/* Stablecoin Selector */}
        {showStablecoinSelector && direction === 'send' && (
          <div>
            <label className={`block text-sm font-semibold ${mutedTextClass} mb-2`}>
              Select stablecoin
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STABLECOINS).map(([code, config]) => (
                <StablecoinButton
                  key={code}
                  code={code}
                  config={config}
                  isSelected={stablecoin === code}
                  onClick={() => handleStablecoinChange(code)}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Amount Input */}
        <div>
          <label 
            htmlFor="fx-amount-input"
            className={`block text-sm font-semibold ${mutedTextClass} mb-2`}
          >
            {inputLabel}
          </label>
          <div className="relative">
            <input
              id="fx-amount-input"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={inputValue}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              aria-describedby={inputError ? "fx-amount-error" : undefined}
              aria-invalid={!!inputError}
              className={`w-full text-2xl sm:text-3xl font-bold px-4 py-3 pr-20 rounded-xl border-2 ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 ${focusRingClass} transition-all tabular-nums font-mono ${inputError ? 'border-red-500' : ''}`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-base sm:text-lg font-semibold ${mutedTextClass} pointer-events-none`}>
              {inputSuffix}
            </span>
          </div>
          {inputError && (
            <p id="fx-amount-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {inputError}
            </p>
          )}
        </div>
        
        {/* Preset Buttons */}
        {direction === 'send' && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Preset amounts">
            {PRESET_AMOUNTS.map(preset => (
              <PresetButton
                key={preset}
                amount={preset}
                isSelected={amount === preset && !inputError}
                onClick={() => handlePresetClick(preset)}
                isDark={isDark}
              />
            ))}
          </div>
        )}
        
        {/* Currency Selector */}
        <div>
          <label className={`block text-sm font-semibold ${mutedTextClass} mb-2`}>
            {direction === 'send' ? 'Convert to' : 'Currency'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(FX_RATES).map(([code, config]) => (
              <CurrencyButton
                key={code}
                code={code}
                config={config}
                isSelected={currency === code}
                onClick={() => handleCurrencyChange(code)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* ========== RESULTS CARD ========== */}
      {amount > 0 && ripeConversion && !inputError && (
        <div 
          className={`mt-6 p-5 sm:p-6 rounded-2xl transition-all relative overflow-hidden`}
          style={{ 
            background: isDark 
              ? 'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(124,58,237,0.1) 100%)' 
              : 'linear-gradient(135deg, rgba(0,212,170,0.05) 0%, rgba(124,58,237,0.05) 100%)',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #00d4aa, #7c3aed) 1'
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Headline */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left flex-1">
              <p className={`text-xs sm:text-sm ${mutedTextClass} mb-1`}>You send</p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums font-mono" style={{ color: stablecoinConfig?.color || '#00d4aa' }}>
                {formatUSDC(direction === 'receive' ? ripeConversion.requiredUSDC : amount)} {stablecoin}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <ArrowRight className={`w-6 h-6 ${mutedTextClass} transform sm:rotate-0 rotate-90`} />
              </div>
            </div>
            
            <div className="text-center sm:text-right flex-1">
              <p className={`text-xs sm:text-sm ${mutedTextClass} mb-1`}>Recipient gets</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 tabular-nums font-mono">
                {formatCurrency(direction === 'receive' ? amount : ripeConversion.netFiatReceived, currency)}
              </p>
            </div>
          </div>
          
          {/* Effective Rate */}
          <div className={`mt-4 pt-4 border-t ${borderClass} text-center`}>
            <p className={`text-xs sm:text-sm ${mutedTextClass}`}>
              Effective rate: <span className="font-bold text-base">{formatCurrency(ripeConversion.effectiveRate, currency)}</span> per {stablecoin}
              <span className={`ml-2 text-xs ${mutedTextClass}`}>
                (vs interbank {formatCurrency(currencyConfig.interbank, currency)})
              </span>
            </p>
          </div>
        </div>
      )}
      
      {/* ========== FEE BREAKDOWN ========== */}
      {amount > 0 && ripeConversion && !inputError && (
        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: '#00d4aa' }} />
            Transparent Fee Breakdown
          </h3>
          <div className={`p-4 rounded-xl ${cardBgClass} border ${borderClass}`}>
            
            <FeeLineItem
              label={`Gross amount at ${currencyConfig.symbol}${currencyConfig.customer}`}
              value={formatCurrency(ripeConversion.grossFiat, currency)}
              mutedTextClass={mutedTextClass}
            />
            
            <FeeLineItem
              label={`Ripe transaction fee (${FEES.transactionFeePercent}%)`}
              hint={ripeConversion.transactionFee === FEES.minimumFee ? `Min fee applied` : null}
              value={formatCurrency(ripeConversion.transactionFeeInFiat, currency)}
              isDeduction
              mutedTextClass={mutedTextClass}
            />
            
            <FeeLineItem
              label="Network fee"
              hint={`$${FEES.networkFeeUSD} flat`}
              value={formatCurrency(ripeConversion.networkFee, currency)}
              isDeduction
              mutedTextClass={mutedTextClass}
            />
            
            <div className={`flex justify-between items-center py-1 ${mutedTextClass}`}>
              <span className="flex items-center gap-1">
                FX spread ({ripeConversion.fxSpreadPercent.toFixed(2)}%)
                <span className="text-xs">(built into rate)</span>
              </span>
              <span className="text-xs font-medium text-green-600">Transparent</span>
            </div>
            
            {/* Divider */}
            <div className={`border-t-2 ${borderClass} my-3`}></div>
            
            {/* Net Amount */}
            <FeeLineItem
              label="Net amount received"
              value={formatCurrency(ripeConversion.netFiatReceived, currency)}
              isTotal
              mutedTextClass={mutedTextClass}
            />
            
            <p className={`text-xs ${mutedTextClass} mt-2 text-right`}>
              Total fees: {formatCurrency(ripeConversion.totalFeesInFiat, currency)} ({ripeConversion.totalFeesPercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      )}
      
      {/* ========== COMPARISON VIEW ========== */}
      {amount > 0 && showComparison && ripeConversion && legacyConversion && savings && !inputError && (
        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-bold mb-3">Compare & Save</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Legacy Provider */}
            <div className={`p-4 rounded-xl border-2 ${borderClass} ${cardBgClass} opacity-75`}>
              <div className="text-center mb-3">
                <p className={`text-sm ${mutedTextClass} mb-1 flex items-center justify-center gap-1`}>
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  Traditional Bank
                </p>
                <p className="text-xl font-bold text-red-600 tabular-nums font-mono">
                  {formatCurrency(legacyConversion.netFiatReceived, currency)}
                </p>
              </div>
              <div className={`text-xs ${mutedTextClass} space-y-1`}>
                <div className="flex justify-between">
                  <span>Transaction fee</span>
                  <span className="text-red-500">3.0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network fee</span>
                  <span className="text-red-500">$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Hidden FX spread</span>
                  <span className="text-red-500">~2.5%</span>
                </div>
              </div>
            </div>
            
            {/* Ripe */}
            <div className="p-4 rounded-xl relative overflow-hidden" style={{ background: isDark ? 'linear-gradient(135deg, rgba(0,212,170,0.15) 0%, rgba(124,58,237,0.15) 100%)' : 'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(124,58,237,0.1) 100%)', border: '2px solid #00d4aa' }}>
              <div className="text-center mb-3">
                <p className="text-sm mb-1 flex items-center justify-center gap-1" style={{ color: '#00d4aa' }}>
                  <Check className="w-4 h-4" />
                  Ripe
                </p>
                <p className="text-xl font-bold tabular-nums font-mono" style={{ color: '#00d4aa' }}>
                  {formatCurrency(ripeConversion.netFiatReceived, currency)}
                </p>
              </div>
              <div className={`text-xs space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex justify-between">
                  <span>Transaction fee</span>
                  <span className="font-semibold">0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network fee</span>
                  <span className="font-semibold">$2.00</span>
                </div>
                <div className="flex justify-between">
                  <span>FX spread</span>
                  <span className="font-semibold">~0.85%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Savings Highlight */}
          {savings.ripeBetter && (
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(124,58,237,0.2) 100%)', border: '1px solid rgba(0,212,170,0.4)' }}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                <TrendingDown className="w-5 h-5 flex-shrink-0" style={{ color: '#00d4aa' }} />
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  You receive <span style={{ color: '#00d4aa' }}>{formatCurrency(savings.amount, currency)}</span> more with Ripe
                  <span className="ml-2 text-sm font-normal">({savings.percent.toFixed(1)}% better)</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* ========== DETAILED MATH EXPANDER ========== */}
      {amount > 0 && ripeConversion && !inputError && (
        <div className="mt-6">
          <button
            type="button"
            onClick={toggleDetails}
            className={`flex items-center gap-2 text-sm font-semibold ${mutedTextClass} hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 -ml-2`}
            aria-expanded={showDetails}
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Show'} detailed calculation
          </button>
          
          {showDetails && (
            <div className={`mt-3 p-4 rounded-xl ${cardBgClass} border ${borderClass} text-sm space-y-4`}>
              <div>
                <p className="font-semibold mb-1">Step 1: Apply customer FX rate</p>
                <p className={`${mutedTextClass} font-mono text-xs sm:text-sm`}>
                  {formatUSDC(direction === 'receive' ? ripeConversion.requiredUSDC : amount)} USDC × {currencyConfig.customer} = {formatCurrency(ripeConversion.grossFiat, currency)}
                </p>
              </div>
              
              <div>
                <p className="font-semibold mb-1">Step 2: Calculate transaction fee</p>
                <p className={`${mutedTextClass} font-mono text-xs sm:text-sm`}>
                  {formatUSDC(direction === 'receive' ? ripeConversion.requiredUSDC : amount)} USDC × {FEES.transactionFeePercent}% = {formatUSDC(ripeConversion.transactionFee)} USDC
                </p>
                <p className={`${mutedTextClass} font-mono text-xs sm:text-sm`}>
                  → {formatCurrency(ripeConversion.transactionFeeInFiat, currency)} in {currency}
                </p>
              </div>
              
              <div>
                <p className="font-semibold mb-1">Step 3: Add network fee</p>
                <p className={`${mutedTextClass} font-mono text-xs sm:text-sm`}>
                  ${FEES.networkFeeUSD} × {currencyConfig.customer} = {formatCurrency(ripeConversion.networkFee, currency)}
                </p>
              </div>
              
              <div>
                <p className="font-semibold mb-1">Step 4: Calculate net amount</p>
                <p className={`${mutedTextClass} font-mono text-xs sm:text-sm`}>
                  {formatCurrency(ripeConversion.grossFiat, currency)} − {formatCurrency(ripeConversion.transactionFeeInFiat, currency)} − {formatCurrency(ripeConversion.networkFee, currency)} = {formatCurrency(ripeConversion.netFiatReceived, currency)}
                </p>
              </div>
              
              <div className={`pt-3 border-t ${borderClass}`}>
                <p className="font-semibold" style={{ color: '#00d4aa' }}>
                  ✓ Effective rate: 1 USDC = {formatCurrency(ripeConversion.effectiveRate, currency)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* ========== ZERO AMOUNT MESSAGE ========== */}
      {(amount === 0 || !amount) && !inputError && (
        <div className={`mt-6 p-8 rounded-xl ${cardBgClass} border ${borderClass} text-center`}>
          <Info className={`w-12 h-12 mx-auto mb-3 ${mutedTextClass}`} />
          <p className={mutedTextClass}>Enter an amount to see conversion details</p>
        </div>
      )}
      
      {/* ========== FOOTER / TRUST SIGNALS ========== */}
      <div className={`mt-6 pt-6 border-t ${borderClass}`}>
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <span className={`flex items-center gap-1 ${mutedTextClass}`}>
            <Shield className="w-3 h-3" style={{ color: '#00d4aa' }} />
            All fees shown upfront
          </span>
          <span className={`flex items-center gap-1 ${mutedTextClass}`}>
            <Check className="w-3 h-3" style={{ color: '#00d4aa' }} />
            No hidden charges
          </span>
          <span className={`flex items-center gap-1 ${mutedTextClass}`}>
            <Zap className="w-3 h-3" style={{ color: '#7c3aed' }} />
            Instant settlement
          </span>
        </div>
        
        {/* Supported Stablecoins */}
        <div className="flex justify-center gap-3 mt-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            USDC
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            USDT
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            USDG
          </span>
        </div>
        
        <p className={`text-center text-xs ${mutedTextClass} mt-3`}>
          Powered by <span className="font-semibold" style={{ background: 'linear-gradient(90deg, #00d4aa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ripe</span> — From stablecoin to e-wallet
        </p>
      </div>
    </div>
  );
};

export default FXWidget;
