export default function TestColorPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Primary Color Test</h1>
      
      <div className="space-y-2">
        <p>This should be golden yellow (#f7d16e):</p>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
          Primary Button
        </button>
        
        {/* Force generation of bg-primary */}
        <div className="hidden bg-primary"></div>
      </div>

      <div className="space-y-2">
        <p>Direct color test:</p>
        <div className="w-32 h-32 bg-primary"></div>
      </div>

      <div className="space-y-2">
        <p>CSS Variable values:</p>
        <div className="font-mono text-sm">
          <p>--primary: 42 88% 71%</p>
          <p>Expected color: #f7d16e</p>
        </div>
      </div>

      <div className="space-y-2">
        <p>Inline style test (should be #f7d16e):</p>
        <div 
          className="w-32 h-32" 
          style={{ backgroundColor: '#f7d16e' }}
        ></div>
      </div>
      
      <div className="space-y-2">
        <p>HSL test:</p>
        <div 
          className="w-32 h-32" 
          style={{ backgroundColor: 'hsl(42, 88%, 71%)' }}
        ></div>
      </div>
    </div>
  );
} 