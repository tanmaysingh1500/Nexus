import { Check } from 'lucide-react';

export default async function PricingPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Free Self-Hosted Edition</h1>
        <p className="text-xl text-gray-600">No paid subscription required</p>
        <p className="text-lg text-gray-500 mt-2">Run Nexus locally with open-source components</p>
      </div>
      
      <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto">
        <PricingCard
          name="Community"
          price="₹0"
          features={[
            'Unlimited incidents',
            'All core integrations enabled',
            'Local PostgreSQL support',
            'Optional local LLM with Ollama',
            'Self-hosted monitoring stack (Prometheus/Grafana OSS)',
            'No billing required'
          ]}
          popular={true}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  features,
  popular = false,
}: {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div className={`relative pt-6 border rounded-lg p-6 bg-white shadow-sm ${popular ? 'border-orange-500 border-2' : ''}`}>
      {popular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-orange-500 text-white px-3 py-1 text-sm font-medium rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-4xl font-medium text-gray-900 mb-1">
        {price}
      </p>
      <ul className="space-y-4 mb-8 mt-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="text-center py-3 px-6 rounded-md bg-gray-100 text-gray-600 font-medium">
        Active Free Plan
      </div>
    </div>
  );
}



