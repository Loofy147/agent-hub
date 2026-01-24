"use client";

import React, { useState } from 'react';
import { Check, Zap, Shield, Target, Wrench, DollarSign, Brain, ArrowRight, Github, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const AgentHubLanding = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const agents = [
    {
      icon: Wrench,
      name: 'Tuber',
      color: 'from-orange-500 to-red-500',
      tagline: 'Database & API Optimizer',
      benefit: 'Eliminate N+1 queries, add indexes, optimize performance',
      metric: '79% faster API responses'
    },
    {
      icon: Zap,
      name: 'Bolt',
      color: 'from-yellow-500 to-orange-500',
      tagline: 'Performance Specialist',
      benefit: 'Bundle optimization, caching, code splitting',
      metric: '60% smaller bundle size'
    },
    {
      icon: Shield,
      name: 'Sentinel',
      color: 'from-blue-500 to-indigo-500',
      tagline: 'Security Guardian',
      benefit: 'Fix XSS, SQL injection, add rate limiting, audit code',
      metric: '100% security compliance'
    },
    {
      icon: Target,
      name: 'Sun Tzu',
      color: 'from-purple-500 to-pink-500',
      tagline: 'Strategic Architect',
      benefit: 'Architecture decisions, ADRs, scalability planning',
      metric: 'Enterprise-grade architecture'
    },
    {
      icon: CheckCircle,
      name: 'Palette',
      color: 'from-pink-500 to-rose-500',
      tagline: 'UX & Accessibility',
      benefit: 'WCAG compliance, UI improvements, user delight',
      metric: '94% accessibility score'
    },
    {
      icon: DollarSign,
      name: 'Midas',
      color: 'from-green-500 to-emerald-500',
      tagline: 'Business Innovator',
      benefit: 'Find monetization opportunities, market validation',
      metric: 'Hidden revenue streams'
    },
    {
      icon: Brain,
      name: 'Oracle',
      color: 'from-indigo-500 to-purple-500',
      tagline: 'Strategic Advisor',
      benefit: 'Human dynamics, power analysis, strategic guidance',
      metric: 'Game-changing insights'
    }
  ];

  const features = [
    {
      icon: CheckCircle,
      title: 'Battle-Tested Protocols',
      description: 'Each agent follows proven execution patterns refined through real-world usage.'
    },
    {
      icon: Zap,
      title: 'Instant Execution',
      description: 'Go from idea to PR in under 30 seconds with automated agent orchestration.'
    },
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'Sandboxed execution, code validation, and enterprise-grade security built-in.'
    },
    {
      icon: Target,
      title: 'Multi-Agent Coordination',
      description: 'Agents work together strategically to tackle complex engineering challenges.'
    }
  ];

  const pricing = [
    {
      name: 'Starter',
      price: 49,
      description: 'Perfect for solo developers',
      features: [
        '3 agent executions per day',
        '1 workspace',
        '7 core agents',
        'Email support',
        'GitHub integration',
        'Basic analytics'
      ],
      cta: 'Start Free Trial',
      highlight: false
    },
    {
      name: 'Professional',
      price: 199,
      description: 'For growing teams',
      features: [
        'Unlimited executions',
        '5 workspaces',
        'All agents + custom agents',
        'Priority support',
        'API access',
        'Team collaboration',
        'Advanced analytics',
        'Slack integration'
      ],
      cta: 'Start Free Trial',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited everything',
        'Self-hosted option',
        'SSO/SAML',
        'Dedicated support',
        'Custom agent training',
        'White-label',
        'SLA guarantees',
        'Audit logs'
      ],
      cta: 'Contact Sales',
      highlight: false
    }
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // In production, this would send to your API
      // For now, simulating success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitted(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
              A
            </div>
            <span className="text-xl font-bold">AgentHub</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#agents" className="hover:text-blue-400 transition">Agents</a>
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#pricing" className="hover:text-blue-400 transition">Pricing</a>
            <a href="/roadmap" className="hover:text-blue-400 transition">Roadmap</a>
            <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm font-medium mb-4">
            💰 Beta Access • Limited Spots Available
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Your{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Autonomous AI Workstation
            </span>
            {' '}for Engineering Excellence
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            7 specialized AI agents that optimize your codebase, fix security issues,
            architect solutions, and discover business opportunities—all on autopilot.
          </p>

          {/* Email Signup */}
          {!submitted ? (
            <div className="max-w-md mx-auto mt-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {loading ? 'Joining...' : (
                    <>
                      Get Early Access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <p className="text-sm text-gray-400 mt-3">
                Join 500+ developers already on the waitlist. No credit card required.
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto mt-8 p-6 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                <CheckCircle className="w-5 h-5" />
                You're on the list!
              </div>
              <p className="text-gray-300 text-sm">
                Check your inbox for beta access details. We'll notify you when your spot is ready.
              </p>
            </div>
          )}

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              500+ developers waiting
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section id="agents" className="py-20 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Your AI Engineering Team
            </h2>
            <p className="text-xl text-gray-300">
              7 specialized agents, each an expert in their domain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {agents.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${agent.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                  <p className="text-gray-400 mb-3 text-sm">{agent.tagline}</p>
                  <p className="text-gray-300 text-sm mb-3">{agent.benefit}</p>
                  <div className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block">
                    {agent.metric}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Built for Production
              </h2>
              <p className="text-xl text-gray-300">
                Enterprise-grade infrastructure from day one
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Start free, scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((tier, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 scale-105 shadow-2xl'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {tier.highlight && (
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-300 mb-4 text-sm">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {typeof tier.price === 'number' ? `$${tier.price}` : tier.price}
                  </span>
                  {typeof tier.price === 'number' && (
                    <span className="text-gray-400">/month</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    tier.highlight
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to 10x Your Engineering Velocity?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the beta and get early access to the future of AI-powered development.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition inline-flex items-center gap-2"
            >
              Get Beta Access
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
                A
              </div>
              <span className="font-bold">AgentHub</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Docs</a>
              <a href="#" className="hover:text-white transition">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">
            © 2026 AgentHub. Built with 7 AI agents. Made by engineers, for engineers.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgentHubLanding;