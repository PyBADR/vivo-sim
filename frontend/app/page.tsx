'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  ArrowRight,
  MessageSquare,
  Radio,
  TrendingUp,
  AlertTriangle,
  Shield,
  Network,
  Layers,
  GitBranch,
  Users,
  BarChart3,
  Cpu,
  Terminal,
  Activity,
  Globe,
  Zap,
  ChevronRight,
  Database,
  Settings2,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import SectionHeading from '@/components/ui/SectionHeading';

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div className="min-h-screen bg-ds-bg text-ds-text">
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO — GCC Crisis Rehearsal Platform
          ═══════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        {/* Grid background */}
        <div className="absolute inset-0 ds-grid-bg opacity-60" />

        {/* Ambient glow orbs */}
        <div className="absolute w-[600px] h-[600px] -top-20 -left-40 rounded-full bg-ds-accent/8 blur-[160px] pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] bottom-0 right-0 rounded-full bg-purple-600/5 blur-[140px] pointer-events-none" />

        {/* Subtle radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#06060A_75%)]" />

        <motion.div
          className="relative z-10 ds-container max-w-5xl mx-auto px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* System badge */}
          <motion.div variants={itemVariants}>
            <div className="ds-badge-accent inline-flex items-center gap-2 mb-8">
              <Globe className="w-3.5 h-3.5" />
              <span>GCC Crisis Rehearsal Platform</span>
            </div>
          </motion.div>

          {/* Display heading */}
          <motion.h1
            variants={itemVariants}
            className="text-display-sm lg:text-display font-bold leading-[1.02] tracking-tight mb-8"
          >
            Rehearse What
            <br />
            <span className="text-ds-accent">Happens Next</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-body-lg text-ds-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Enterprise crisis simulation for GCC decision-makers. Transform scenarios into
            predictive intelligence through 8-stage transformation pipeline. Make decisions
            with confidence.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/demo" className="ds-btn-primary text-[15px] px-8 py-4">
              Launch Simulator
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/architecture" className="ds-btn-secondary text-[15px] px-8 py-4">
              View Pipeline
            </Link>
          </motion.div>

          {/* System status line */}
          <motion.div
            variants={itemVariants}
            className="mt-20 flex items-center justify-center gap-4 text-ds-text-dim"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-ds-success animate-pulse" />
              <span className="text-nano font-mono uppercase tracking-wider">Live</span>
            </div>
            <span className="text-nano">·</span>
            <span className="text-nano font-mono uppercase tracking-wider">Rehearsed Reality</span>
            <span className="text-nano">·</span>
            <span className="text-nano font-mono uppercase tracking-wider">GCC Ready</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          WATCH VIVO SIM IN ACTION
          ═══════════════════════════════════════════ */}
      <section className="ds-section">
        <div className="ds-container">
          <SectionHeading tag="Scenarios" title="Watch VIVO SIM in Action" />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            {[
              {
                num: '01',
                title: 'Oil Market Shock',
                desc: 'Simulate GCC economic response to sudden crude price collapse. Model investor sentiment, government stimulus, citizen confidence.',
              },
              {
                num: '02',
                title: 'Public Health Crisis',
                desc: 'Crisis communication across borders. Predict information spread, misinformation amplification, and public health compliance.',
              },
              {
                num: '03',
                title: 'Cyber Infrastructure Attack',
                desc: 'Critical infrastructure disruption scenario. Assess cascade effects, public panic, cross-sector dependency impacts.',
              },
            ].map((item) => (
              <motion.div
                key={item.num}
                className="ds-card-interactive p-7 group flex flex-col"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: parseInt(item.num) * 0.1, duration: 0.6 }}
              >
                <div className="text-nano font-mono text-ds-accent bg-ds-accent-muted px-2.5 py-1 rounded-md inline-block w-fit">
                  {item.num}
                </div>
                <h3 className="text-h4 mt-5 group-hover:text-ds-text transition-colors">{item.title}</h3>
                <p className="text-caption text-ds-text-secondary mt-3 flex-grow leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-4 flex items-center gap-2 text-ds-accent text-micro font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  View scenario <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PREDICT IN 8 STAGES
          ═══════════════════════════════════════════ */}
      <section className="ds-section bg-ds-bg-alt">
        <div className="ds-container">
          <SectionHeading
            tag="Pipeline"
            title="Predict in 8 Stages"
            subtitle="From scenario to decision intelligence through staged transformation pipeline."
          />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            {[
              {
                icon: Layers,
                step: '01',
                title: 'Normalize',
                desc: 'Parse scenario input across Arabic and English sources into structured form.',
              },
              {
                icon: Radio,
                step: '02',
                title: 'Signals',
                desc: 'Extract entities, topics, actors, and relationships from raw scenario data.',
              },
              {
                icon: Network,
                step: '03',
                title: 'Graph',
                desc: 'Build influence and dependency graph across people, orgs, regions, platforms.',
              },
              {
                icon: Database,
                step: '04',
                title: 'Enrich',
                desc: 'Layer historical data, demographic profiles, behavioral patterns on entities.',
              },
              {
                icon: Zap,
                step: '05',
                title: 'Simulate',
                desc: 'Deploy GCC-specific persona agents to model reactions and cascade effects.',
              },
              {
                icon: BarChart3,
                step: '06',
                title: 'Decision',
                desc: 'Generate decision briefs with confidence scores and key impact drivers.',
              },
              {
                icon: MessageSquare,
                step: '07',
                title: 'Brief',
                desc: 'Create executive communications and stakeholder-specific narratives.',
              },
              {
                icon: Settings2,
                step: '08',
                title: 'Analyze',
                desc: 'Run sensitivity analysis and iterate for scenario planning refinement.',
              },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  className="ds-card p-7 flex flex-col group hover:border-ds-accent/15 transition-all duration-300"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06, duration: 0.6 }}
                >
                  <div className="w-10 h-10 rounded-ds bg-ds-surface-raised border border-ds-border flex items-center justify-center mb-5 group-hover:border-ds-accent/20 transition-colors">
                    <IconComponent className="w-[18px] h-[18px] text-ds-text-muted group-hover:text-ds-accent transition-colors" />
                  </div>
                  <div className="text-nano font-mono text-ds-accent-dim">{item.step}</div>
                  <h3 className="text-h4 mt-2 text-left">{item.title}</h3>
                  <p className="text-caption text-ds-text-secondary mt-2.5 flex-grow text-left leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BUILT FOR GCC SCENARIOS
          ═══════════════════════════════════════════ */}
      <section className="ds-section">
        <div className="ds-container">
          <SectionHeading tag="Use Cases" title="Built for GCC Scenarios" />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            {[
              {
                icon: Users,
                title: 'Government Decision-Making',
                desc: 'Cabinet-level scenario planning and policy impact simulation before public announcement.',
              },
              {
                icon: MessageSquare,
                title: 'Crisis Communication',
                desc: 'Multi-channel communications strategy rehearsal across public, stakeholders, media.',
              },
              {
                icon: TrendingUp,
                title: 'Supply Chain Resilience',
                desc: 'Model cascade effects of disruption across GCC supply networks and dependencies.',
              },
              {
                icon: Shield,
                title: 'Business Continuity',
                desc: 'Enterprise scenario planning for operational resilience across geopolitical events.',
              },
              {
                icon: Radio,
                title: 'Cross-Border Coordination',
                desc: 'Simulate coordination challenges and response alignment across multiple GCC nations.',
              },
              {
                icon: Zap,
                title: 'Strategic Planning',
                desc: 'Long-term scenario modeling for investment, partnerships, and strategic direction.',
              },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  className="ds-card-interactive p-7"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06, duration: 0.6 }}
                >
                  <div className="w-11 h-11 rounded-ds bg-ds-accent-muted flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-ds-accent" />
                  </div>
                  <h3 className="text-h4 mt-5">{item.title}</h3>
                  <p className="text-caption text-ds-text-secondary mt-2.5 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BUILT FOR REHEARSED REALITY
          ═══════════════════════════════════════════ */}
      <section id="about" className="ds-section bg-ds-bg-alt">
        <div className="ds-container">
          <SectionHeading tag="Platform" title="Built for Rehearsed Reality" />

          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-body-lg text-ds-text-secondary leading-relaxed text-center">
              VIVO SIM transforms crisis scenarios into executable intelligence. Our 8-stage pipeline
              processes real-world inputs—policy changes, market events, security threats—into predictive
              models that reveal cascade effects, decision points, and stakeholder responses. Enterprise
              decision-makers use VIVO SIM to rehearse crises before they happen, making informed choices
              with confidence.
            </p>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { value: '10k+', label: 'Simulations Run' },
                { value: '92%', label: 'Avg Confidence Score' },
                { value: '8', label: 'Stages Pipeline' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="ds-card p-6 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="text-h1 text-ds-accent font-mono font-bold">{stat.value}</div>
                  <div className="text-micro text-ds-text-muted mt-2 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LIVE SIMULATOR
          ═══════════════════════════════════════════ */}
      <section className="ds-section">
        <div className="ds-container">
          <SectionHeading tag="Command Center" title="Live Simulator" />

          <motion.div
            className="ds-gradient-border p-[1px]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-ds-surface rounded-ds-xl overflow-hidden">
              <div className="h-96 flex flex-col items-center justify-center relative overflow-hidden p-8">
                <div className="absolute inset-0 ds-grid-bg opacity-30" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <Terminal className="w-12 h-12 text-ds-accent mb-4 opacity-75" />
                  <h3 className="text-h3 text-ds-text">Crisis Command Center</h3>
                  <p className="text-body-lg text-ds-text-secondary mt-3 max-w-lg">
                    Real-time scenario modeling with live parameter adjustment. Run what-if scenarios,
                    compare outcomes, and brief leadership in minutes.
                  </p>
                  <Link href="/simulator" className="ds-btn-primary text-[15px] px-8 py-4 mt-8">
                    Enter Command Center
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SYSTEM ARCHITECTURE OVERVIEW
          ═══════════════════════════════════════════ */}
      <section className="ds-section bg-ds-bg-alt">
        <div className="ds-container">
          <SectionHeading tag="Architecture" title="System Architecture Overview" />

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="ds-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div>
                    <h4 className="text-h4 text-ds-accent mb-3">Input Layer</h4>
                    <p className="text-caption text-ds-text-secondary leading-relaxed">
                      Multi-source scenario ingestion supporting Arabic/English text, structured data, and real-time signals.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-h4 text-ds-accent mb-3">Processing Pipeline</h4>
                    <p className="text-caption text-ds-text-secondary leading-relaxed">
                      NLP entity extraction, relationship mapping, behavioral profiling, and cascade modeling.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-h4 text-ds-accent mb-3">Intelligence Engine</h4>
                    <p className="text-caption text-ds-text-secondary leading-relaxed">
                      GCC-specific persona agents simulating institutional decisions, public reactions, and media dynamics.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-h4 text-ds-accent mb-3">Output Layer</h4>
                    <p className="text-caption text-ds-text-secondary leading-relaxed">
                      Executive briefs, decision matrices, sensitivity analysis, and stakeholder-specific narratives.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div>
                    <h4 className="text-h4 text-ds-accent mb-3">Data Foundation</h4>
                    <p className="text-caption text-ds-text-secondary leading-relaxed">
                      Historical events, demographic profiles, behavioral baselines, and GCC-context knowledge graph.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-h4 text-ds-accent mb-3">Validation & Confidence</h4>
                    <p className="text-caption text-ds-text-secondary leading-relaxed">
                      Multi-factor confidence scoring, historical accuracy tracking, and prediction validation.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-h4 text-ds-accent mb-3">Integration Points</h4>
                    <p className="text-caption text-ds-text-secondary leading-relaxed">
                      APIs for enterprise systems, simulation controls, batch processing, and custom workflows.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-h4 text-ds-accent mb-3">Security & Compliance</h4>
                    <p className="text-caption text-ds-text-secondary leading-relaxed">
                      GCC data residency, encryption, audit logging, and enterprise access controls.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SOURCE DATA FLOW
          ═══════════════════════════════════════════ */}
      <section className="ds-section">
        <div className="ds-container">
          <SectionHeading tag="Data Pipeline" title="Source Data Flow" />

          <motion.div
            className="max-w-4xl mx-auto space-y-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            {[
              { step: 'Input Ingestion', desc: 'Receive scenario from decision-maker, news feed, or alert system' },
              { step: 'Normalization', desc: 'Standardize across language, format, and temporal context' },
              { step: 'Entity Extraction', desc: 'Identify actors, organizations, locations, events, and topics' },
              { step: 'Relationship Mapping', desc: 'Build influence, dependency, and reaction pathways' },
              { step: 'Data Enrichment', desc: 'Layer historical context, behavioral patterns, stakeholder profiles' },
              { step: 'Simulation Execution', desc: 'Deploy agents to model cascade effects over time' },
              { step: 'Analysis & Insight', desc: 'Generate predictions, confidence scores, and impact drivers' },
              { step: 'Decision Output', desc: 'Deliver executive brief, recommendations, and what-if scenarios' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="ds-card p-5 flex items-center gap-4 group hover:border-ds-accent/15 transition-all"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ds-accent-muted flex items-center justify-center text-ds-accent font-mono font-bold text-nano">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex-grow">
                  <h4 className="text-h4 text-ds-text">{item.step}</h4>
                  <p className="text-caption text-ds-text-secondary mt-1">{item.desc}</p>
                </div>
                <ChevronRight className="flex-shrink-0 w-4 h-4 text-ds-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ABOUT & VISION
          ═══════════════════════════════════════════ */}
      <section className="ds-section bg-ds-bg-alt">
        <div className="ds-container">
          <SectionHeading tag="Vision" title="Rehearse. Decide. Succeed." />

          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-body-lg text-ds-text-secondary leading-relaxed text-center">
              Crisis leadership isn't about prediction—it's about preparation. VIVO SIM gives GCC
              enterprises the confidence to act decisively in uncertain times. By rehearsing scenarios
              before they happen, decision-makers can identify vulnerabilities, align stakeholders,
              and execute with precision.
            </p>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { value: '4.2B', label: 'People in GCC Region' },
                { value: '28%', label: 'Avg Crisis Impact on GDP' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="ds-card p-6 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="text-h1 text-ds-accent font-mono font-bold">{stat.value}</div>
                  <div className="text-micro text-ds-text-muted mt-2 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════ */}
      <section className="ds-section">
        <div className="ds-container">
          <motion.div
            className="ds-gradient-border p-[1px] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="ds-card p-14 lg:p-20 rounded-ds-xl text-center bg-gradient-to-br from-ds-surface to-ds-bg">
              <h2 className="text-h2 lg:text-h1 text-ds-text">Start Your Crisis Rehearsal</h2>
              <p className="text-body-lg text-ds-text-secondary mt-4 max-w-xl mx-auto">
                Experience VIVO SIM's 8-stage pipeline. Model scenarios, see cascade effects, and brief leadership.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Link href="/simulator" className="ds-btn-primary text-[15px] px-8 py-4">
                  Launch Simulator
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="ds-btn-secondary text-[15px] px-8 py-4">
                  Request Demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
