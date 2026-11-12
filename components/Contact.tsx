import React, { useState } from 'react';
import { useReveal } from '../lib/hooks';
import { sound } from '../lib/audio';
import { Arrow, Eyebrow, Split } from './Bits';

export const LinkedInIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.83v1.57h.05c.53-.95 1.84-1.95 3.78-1.95 4.04 0 4.79 2.66 4.79 6.12v5.76h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.69v5.19h-4V9.75Z" />
  </svg>
);

export const GitHubIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

interface ContactProps {
  showToast: (title: string, message: string) => void;
}

const goals = [
  'SaaS Project Collab',
  'Prompt Engineering',
  'Startup / Hackathon',
  'Internship / Hiring',
  'General Discussion',
];

const times = [
  { label: 'Immediate', sub: 'This Week' },
  { label: 'Short Term', sub: '1-2 Weeks' },
  { label: 'Mid Term', sub: '1 Month' },
  { label: 'Flexible', sub: 'Anytime' },
];

const Contact: React.FC<ContactProps> = ({ showToast }) => {
  const head = useReveal<HTMLDivElement>(0.15);
  const body = useReveal<HTMLDivElement>(0.06);
  const [selectedGoal, setSelectedGoal] = useState('SaaS Architecture');
  const [selectedTime, setSelectedTime] = useState('Immediate (This Week)');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.blip(5, 0.7);
    sound.blip(8, 0.5, 0.3);
    showToast(
      'Message Received',
      `Thank you ${formData.name || 'Friend'}. Sai will review your ${selectedGoal} note and get back to you promptly.`
    );
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <div ref={head} className="contact__head reveal">
          <Eyebrow>06 — Initiate Connection</Eyebrow>
          <h2 className="display display--xl"><Split>
            LET&apos;S CONNECT.
            <br />
            <span className="thin">LET&apos;S</span> <span className="acc">BUILD.</span>
          </Split></h2>
          <p className="lede">
            Reach out for project collaborations, startup discussions, hackathons, AI inquiries, or internship
            opportunities.
          </p>
        </div>

        <div ref={body} className="contact__grid reveal">
          <div className="form-wrap">
            <p className="form-wrap__kicker">GET IN TOUCH · COLLABORATION</p>
            <h3 className="form-wrap__title">START A CONVERSATION</h3>
            <p className="form-wrap__lead">
              Interested in building together, discussing an AI project, or exploring internship opportunities? Send a
              message below.
            </p>

            <form onSubmit={handleSubmit} className="form">
              <label className="field">
                <span className="field__label">
                  01 · FULL NAME <b>*</b>
                </span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ENTER YOUR FULL NAME"
                  className="input"
                />
              </label>
              <label className="field">
                <span className="field__label">
                  02 · PHONE NUMBER <b>*</b>
                </span>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 99874 03394"
                  className="input"
                />
              </label>
              <label className="field field--wide">
                <span className="field__label">
                  03 · EMAIL ADDRESS <b>*</b>
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="FOUNDER@COMPANY.COM"
                  className="input"
                />
              </label>

              <fieldset className="field field--wide">
                <legend className="field__label">04 · PRIMARY OBJECTIVE</legend>
                <div className="chips">
                  {goals.map((g, i) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={selectedGoal === g}
                      className={`chipbtn ${selectedGoal === g ? 'is-on' : ''}`}
                      onClick={() => {
                        sound.blip(i + 2, 0.4);
                        setSelectedGoal(g);
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="field field--wide">
                <legend className="field__label">05 · TIMEFRAME &amp; URGENCY</legend>
                <div className="chips">
                  {times.map((t, i) => {
                    const on = selectedTime.includes(t.label);
                    return (
                      <button
                        key={t.label}
                        type="button"
                        aria-pressed={on}
                        className={`chipbtn ${on ? 'is-on' : ''}`}
                        onClick={() => {
                          sound.blip(i + 3, 0.4);
                          setSelectedTime(`${t.label} (${t.sub})`);
                        }}
                      >
                        {t.label} <small>{t.sub}</small>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="field field--wide">
                <span className="field__label">06 · MESSAGE / PROJECT BRIEF</span>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="TELL ME ABOUT YOUR PROJECT, IDEA, OR OPPORTUNITY..."
                  className="input input--area"
                />
              </label>

              <div className="field--wide form__submit">
                <button type="submit" className="pill pill--solid pill--xl">
                  SEND MESSAGE <Arrow size={16} />
                </button>
                <p className="form__note">Student AI Architect · Fast Response · Open to Ideas</p>
              </div>
            </form>
          </div>

          <aside className="chan">
            <div className="chan__block">
              <p className="chan__kicker">DIRECT CHANNELS</p>
              <h4>REACH SAI SRIKIRAN</h4>
              <a href="mailto:jandhyala.saisrikiran25@iimb.ac.in" className="chan__link">
                jandhyala.saisrikiran25@iimb.ac.in
              </a>
              <a href="tel:9987403394" className="chan__link">
                +91 9987403394
              </a>
            </div>

            <div className="chan__block">
              <p className="chan__kicker">VERIFIED PROFILES</p>
              <h4>NETWORKS &amp; REPOSITORIES</h4>
              <div className="chan__social">
                <a href="https://www.linkedin.com/in/sai-srikiran-j-85983a36b/" target="_blank" rel="noreferrer">
                  <LinkedInIcon size={16} /> LinkedIn <Arrow />
                </a>
                <a href="https://github.com/saisrikiran25-ctrl" target="_blank" rel="noreferrer">
                  <GitHubIcon size={16} /> GitHub <Arrow />
                </a>
              </div>
            </div>

            <div className="chan__block">
              <p className="chan__kicker">LOCATION &amp; ACADEMIA</p>
              <h4>HEADQUARTERS</h4>
              <p className="chan__text">
                Mumbai &amp; Kakinada, India
                <br />
                Indian Institute of Management Bangalore (IIMB) · DBE
                <br />
                Indian Institute of Foreign Trade (IIFT) · Integrated Program in Management
              </p>
              <p className="chan__open">
                <i /> OPEN TO PROJECTS &amp; OPPORTUNITIES
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Contact;
