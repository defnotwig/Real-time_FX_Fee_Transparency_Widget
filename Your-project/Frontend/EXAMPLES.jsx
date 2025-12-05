// ============================================================================
// USAGE EXAMPLES - Ripe FX Widget
// ============================================================================

import React from 'react';
import FXWidget from './FXWidget';

// ============================================================================
// Example 1: Basic Usage (Minimal Configuration)
// ============================================================================

export function BasicExample() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Basic FX Widget</h1>
      <FXWidget />
    </div>
  );
}

// ============================================================================
// Example 2: Custom Default Values
// ============================================================================

export function CustomDefaultsExample() {
  return (
    <FXWidget 
      defaultCurrency="THB"
      defaultAmount={500}
      theme="dark"
    />
  );
}

// ============================================================================
// Example 3: With Conversion Callback
// ============================================================================

export function CallbackExample() {
  const handleConversion = (result) => {
    console.log('Conversion Result:', result);
    
    // Send to analytics
    window.gtag?.('event', 'conversion_calculated', {
      currency: result.currency,
      amount: result.netFiatReceived,
      fees: result.totalFeesInFiat
    });
    
    // Update parent state
    // setConversionData(result);
  };
  
  return (
    <FXWidget 
      defaultCurrency="PHP"
      defaultAmount={1000}
      onConversionComplete={handleConversion}
    />
  );
}

// ============================================================================
// Example 4: Custom Branding
// ============================================================================

export function BrandedExample() {
  return (
    <div className="bg-purple-50 p-8 rounded-xl">
      <FXWidget 
        brandColor="#9333EA"  // Purple brand color
        defaultCurrency="MYR"
        showComparison={true}
      />
    </div>
  );
}

// ============================================================================
// Example 5: Embedded in Form
// ============================================================================

export function FormIntegrationExample() {
  const [formData, setFormData] = React.useState({
    recipientName: '',
    recipientEmail: '',
    conversionAmount: null
  });
  
  const handleConversionComplete = (result) => {
    setFormData(prev => ({
      ...prev,
      conversionAmount: result.netFiatReceived
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    // Process payment...
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Send Money</h2>
      
      {/* Recipient Details */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block font-semibold mb-2">Recipient Name</label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Recipient Email</label>
          <input
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
      </div>
      
      {/* FX Widget */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Conversion Details</h3>
        <FXWidget 
          defaultCurrency="PHP"
          defaultAmount={100}
          onConversionComplete={handleConversionComplete}
        />
      </div>
      
      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
      >
        Proceed to Payment
      </button>
    </form>
  );
}

// ============================================================================
// Example 6: Multiple Widgets (Comparison Dashboard)
// ============================================================================

export function DashboardExample() {
  const currencies = ['PHP', 'THB', 'IDR', 'MYR'];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {currencies.map(currency => (
        <div key={currency} className="border rounded-xl p-4">
          <h3 className="text-lg font-bold mb-3">
            Send to {currency}
          </h3>
          <FXWidget 
            defaultCurrency={currency}
            defaultAmount={100}
            showComparison={false}
            theme="light"
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 7: Modal/Popup Integration
// ============================================================================

export function ModalExample() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold"
      >
        Calculate FX Rate
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">FX Calculator</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <FXWidget 
                defaultCurrency="PHP"
                defaultAmount={100}
              />
              
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// Example 8: With State Management (Redux/Zustand)
// ============================================================================

// Using Zustand store
import { create } from 'zustand';

const useConversionStore = create((set) => ({
  lastConversion: null,
  setConversion: (data) => set({ lastConversion: data }),
}));

export function StateManagedExample() {
  const { lastConversion, setConversion } = useConversionStore();
  
  return (
    <div>
      <FXWidget 
        defaultCurrency="PHP"
        defaultAmount={100}
        onConversionComplete={setConversion}
      />
      
      {lastConversion && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold">Last Conversion:</p>
          <p>Net received: {lastConversion.netFiatReceived.toFixed(2)}</p>
          <p>Effective rate: {lastConversion.effectiveRate.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 9: Responsive Embed (Fixed Width)
// ============================================================================

export function FixedWidthExample() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto">
        {/* Constrained to 448px max width */}
        <FXWidget 
          defaultCurrency="THB"
          defaultAmount={200}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 10: Side-by-side with Content
// ============================================================================

export function ContentIntegrationExample() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Left: Content */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Why Choose Ripe?</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            ✅ <strong>Transparent Pricing:</strong> See every fee before you send.
          </p>
          <p>
            ✅ <strong>Lightning Fast:</strong> Transfers complete in minutes.
          </p>
          <p>
            ✅ <strong>Best Rates:</strong> Save up to 90% vs traditional banks.
          </p>
          <p>
            ✅ <strong>Secure:</strong> Bank-grade encryption and compliance.
          </p>
        </div>
      </div>
      
      {/* Right: Widget */}
      <div>
        <FXWidget 
          defaultCurrency="PHP"
          defaultAmount={500}
          showComparison={true}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 11: API Integration (Live Rates)
// ============================================================================

export function LiveRatesExample() {
  const [rates, setRates] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Fetch live rates from API
    fetch('https://api.example.com/fx-rates')
      .then(res => res.json())
      .then(data => {
        setRates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch rates:', err);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return <div className="text-center p-8">Loading rates...</div>;
  }
  
  return (
    <div>
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          ✓ Rates updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
      
      <FXWidget 
        defaultCurrency="PHP"
        defaultAmount={100}
        // In production, you'd pass live rates as props
      />
    </div>
  );
}

// ============================================================================
// Example 12: A/B Testing Variant
// ============================================================================

export function ABTestExample() {
  const variant = Math.random() > 0.5 ? 'A' : 'B';
  
  return (
    <div>
      {/* Track which variant user sees */}
      <div className="sr-only">Variant: {variant}</div>
      
      <FXWidget 
        defaultCurrency="PHP"
        defaultAmount={100}
        showComparison={variant === 'A'} // Only variant A shows comparison
        onConversionComplete={(result) => {
          // Track conversion with variant
          window.analytics?.track('conversion_calculated', {
            variant,
            amount: result.netFiatReceived
          });
        }}
      />
    </div>
  );
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export default {
  BasicExample,
  CustomDefaultsExample,
  CallbackExample,
  BrandedExample,
  FormIntegrationExample,
  DashboardExample,
  ModalExample,
  StateManagedExample,
  FixedWidthExample,
  ContentIntegrationExample,
  LiveRatesExample,
  ABTestExample
};
