import React from 'react';
import './EducationalDisclaimer.css';

/**
 * Non-clinical disclaimer shown on key flows.
 */
export default function EducationalDisclaimer({ compact = false }) {
  return (
    <aside className={`edu-disclaimer ${compact ? 'edu-disclaimer--compact' : ''}`} role="note">
      <strong>Educational guidance only.</strong>{' '}
      SpecialCare Connect supports parents and caregivers with structured questionnaires and activities.
      It is <em>not</em> a licensed medical, psychological, or diagnostic service and does not replace
      qualified professionals. If you have health or safety concerns, contact an appropriate clinician
      or emergency services.
    </aside>
  );
}
