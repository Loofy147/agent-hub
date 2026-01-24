"use client";

import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronRight, Zap, DollarSign, Users, Code, Shield, Palette, Target, Wrench, Brain, ArrowLeft } from 'lucide-react';

const AgentHubStrategicPlan = () => {
  const [expandedPhase, setExpandedPhase] = useState('foundation');
  const [selectedAgent, setSelectedAgent] = useState('overview');

  const agents = [
    { id: 'tuber', name: 'Tuber', icon: Wrench, color: 'text-orange-500', description: 'Data Layer & API' },
    { id: 'bolt', name: 'Bolt', icon: Zap, color: 'text-yellow-500', description: 'Performance' },
    { id: 'sentinel', name: 'Sentinel', icon: Shield, color: 'text-blue-500', description: 'Security & Quality' },
    { id: 'suntzu', name: 'Sun Tzu', icon: Target, color: 'text-purple-500', description: 'Strategic Architecture' },
    { id: 'palette', name: 'Palette', icon: Palette, color: 'text-pink-500', description: 'UX & Accessibility' },
    { id: 'midas', name: 'Midas', icon: DollarSign, color: 'text-green-500', description: 'Business Innovation' },
    { id: 'oracle', name: 'Oracle', icon: Brain, color: 'text-indigo-500', description: 'Human Dynamics' },
  ];

  const phases = {
    foundation: {
      name: 'Phase 1: Foundation',
      duration: '4 weeks',
      goal: 'Build core platform infrastructure',
      status: 'in-progress',
      progress: 45,
      deliverables: [
        { task: 'Multi-tenant database schema', agent: 'tuber', done: true },
        { task: 'Authentication & authorization system', agent: 'sentinel', done: true },
        { task: 'Agent orchestration engine', agent: 'suntzu', done: true },
        { task: 'API gateway with versioning', agent: 'tuber', done: false },
        { task: 'Real-time WebSocket for agent status', agent: 'bolt', done: false },
        { task: 'Stripe billing integration', agent: 'midas', done: false },
      ],
      metrics: {
        'Architecture Decisions': 3,
        'Database Tables': 12,
        'API Endpoints': 24,
        'Test Coverage': '78%'
      }
    },
    mvp: {
      name: 'Phase 2: MVP Launch',
      duration: '6 weeks',
      goal: 'Ship minimal viable product to beta users',
      status: 'planned',
      progress: 0,
      deliverables: [
        { task: 'Agent workspace UI', agent: 'palette', done: false },
        { task: 'Code execution sandbox', agent: 'sentinel', done: false },
        { task: 'Agent activity dashboard', agent: 'palette', done: false },
        { task: 'GitHub integration', agent: 'tuber', done: false },
        { task: 'Agent marketplace (7 agents)', agent: 'midas', done: false },
        { task: 'Onboarding flow', agent: 'palette', done: false },
      ],
      metrics: {
        'Beta Users': '10 target',
        'Agent Executions': '0',
        'Uptime SLA': '99%',
        'Response Time': '<200ms'
      }
    },
    growth: {
      name: 'Phase 3: Growth',
      duration: '12 weeks',
      goal: 'Scale to 100 paying customers',
      status: 'planned',
      progress: 0,
      deliverables: [
        { task: 'Team collaboration features', agent: 'palette', done: false },
        { task: 'Custom agent builder', agent: 'suntzu', done: false },
        { task: 'Advanced analytics', agent: 'bolt', done: false },
        { task: 'Enterprise SSO', agent: 'sentinel', done: false },
        { task: 'API rate limiting & quotas', agent: 'tuber', done: false },
        { task: 'Partner program', agent: 'midas', done: false },
      ],
      metrics: {
        'MRR': '$20K target',
        'Customers': '100',
        'Churn': '<5%',
        'NPS': '>60'
      }
    },
    scale: {
      name: 'Phase 4: Scale',
      duration: '6 months',
      goal: 'Reach $1.2M ARR',
      status: 'planned',
      progress: 0,
      deliverables: [
        { task: 'Multi-region deployment', agent: 'bolt', done: false },
        { task: 'Enterprise tier features', agent: 'midas', done: false },
        { task: 'White-label offering', agent: 'suntzu', done: false },
        { task: 'Advanced security features', agent: 'sentinel', done: false },
        { task: 'AI model fine-tuning', agent: 'oracle', done: false },
        { task: 'Agent ecosystem (50+ agents)', agent: 'midas', done: false },
      ],
      metrics: {
        'ARR': '$1.2M',
        'Customers': '500',
        'Team Size': '8',
        'Valuation': '$3M-6M'
      }
    }
  };

  const businessModel = {
    starter: {
      name: 'Starter',
      price: 49,
      features: [
        '3 agent executions/day',
        '1 workspace',
        '7 core agents',
        'Email support',
        'GitHub integration'
      ]
    },
    professional: {
      name: 'Professional',
      price: 199,
      features: [
        'Unlimited executions',
        '5 workspaces',
        'All agents + custom agents',
        'Priority support',
        'API access',
        'Team collaboration',
        'Advanced analytics'
      ],
      highlight: true
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Unlimited everything',
        'Self-hosted option',
        'SSO/SAML',
        'Dedicated support',
        'Custom agent training',
        'White-label',
        'SLA guarantees'
      ]
    }
  };

  const technicalStack = {
    frontend: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
    backend: ['Node.js', 'Express', 'tRPC', 'Prisma'],
    database: ['PostgreSQL', 'Redis'],
    infrastructure: ['AWS/Vercel', 'Docker', 'Kubernetes'],
    ai: ['Claude API', 'OpenAI (optional)', 'Custom orchestration'],
    monitoring: ['Datadog', 'Sentry', 'PostHog']
  };

  const Phase = ({ id, data }) => {
    const isExpanded = expandedPhase === id;
    const statusColor = data.status === 'in-progress' ? 'bg-blue-500' :
                       data.status === 'completed' ? 'bg-green-500' : 'bg-gray-300';

    return (
      <div className="border rounded-lg overflow-hidden mb-4">
        <div
          className="p-4 bg-gray-50 cursor-pointer flex items-center justify-between hover:bg-gray-100"
          onClick={() => setExpandedPhase(isExpanded ? null : id)}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            <div className={`w-3 h-3 rounded-full ${statusColor}`} />
            <div>
              <h3 className="font-bold">{data.name}</h3>
              <p className="text-sm text-gray-600">{data.duration} • {data.goal}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{data.progress}%</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.progress}%` }} />
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Deliverables</h4>
              <div className="space-y-2">
                {data.deliverables.map((item, idx) => {
                  const agent = agents.find(a => a.id === item.agent);
                  const Icon = agent?.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      {item.done ?
                        <CheckCircle className="w-5 h-5 text-green-500" /> :
                        <Circle className="w-5 h-5 text-gray-300" />
                      }
                      <span className={item.done ? 'line-through text-gray-500' : ''}>
                        {item.task}
                      </span>
                      {Icon && (
                        <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                          <Icon className={`w-4 h-4 ${agent.color}`} />
                          {agent.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              {Object.entries(data.metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="text-2xl font-bold text-blue-600">{value}</div>
                  <div className="text-sm text-gray-600">{key}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-start">
        <a href="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AgentHub SaaS Strategic Launch Plan
        </h1>
        <p className="text-lg text-gray-600">
          Multi-Agent Orchestration Platform • $1.2M ARR Target • 12-Month Roadmap
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
            💰 GOLDMINE Opportunity (92/100)
          </div>
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
            🎯 Strategic Value: 85/100
          </div>
        </div>
      </div>

      {/* Agent Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {agents.map(agent => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="text-center p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedAgent(agent.id)}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${agent.color}`} />
              <div className="font-semibold text-sm">{agent.name}</div>
              <div className="text-xs text-gray-500">{agent.description}</div>
            </div>
          );
        })}
      </div>

      {/* Business Model */}
      <div>
        <h2 className="text-2xl font-bold mb-4">💰 Pricing Strategy</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(businessModel).map(([key, tier]) => (
            <div
              key={key}
              className={`border rounded-lg p-6 ${tier.highlight ? 'ring-2 ring-blue-500 relative' : ''}`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {typeof tier.price === 'number' ? `$${tier.price}` : tier.price}
                </span>
                {typeof tier.price === 'number' && <span className="text-gray-600">/mo</span>}
              </div>
              <ul className="space-y-2">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🚀 Implementation Roadmap</h2>
        {Object.entries(phases).map(([id, data]) => (
          <Phase key={id} id={id} data={data} />
        ))}
      </div>

      {/* Technical Stack */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🛠️ Technical Architecture</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(technicalStack).map(([category, technologies]) => (
            <div key={category} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 capitalize">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-sm rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">📊 Success Metrics (12 Months)</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">$1.2M</div>
            <div className="text-gray-600">ARR Target</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">500</div>
            <div className="text-gray-600">Paying Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">$240</div>
            <div className="text-gray-600">Avg Revenue/Customer</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">60%</div>
            <div className="text-gray-600">Gross Margin</div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-3">🎯 Immediate Next Steps (This Week)</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <span><strong>Tuber:</strong> Design multi-tenant database schema with workspace isolation</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
            <span><strong>Sentinel:</strong> Implement authentication system (email/password + GitHub OAuth)</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
            <span><strong>Sun Tzu:</strong> Write ADR-002 for agent orchestration architecture</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
            <span><strong>Midas:</strong> Create beta landing page with email capture</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
            <span><strong>Palette:</strong> Design agent workspace mockups</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AgentHubStrategicPlan;