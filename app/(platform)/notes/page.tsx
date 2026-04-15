"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
type NoteStatus = "draft" | "signed" | "locked";
type NoteType =
    | "Progress Note"
    | "Intake Assessment"
    | "Psychiatric Evaluation"
    | "Medication Note"
    | "Group Therapy Note"
    | "Crisis Assessment"
    | "Discharge Summary"
    | "Consultation Note";

type ModalType =
    | "create"
    | "edit"
    | "view"
    | "sign"
    | "cosign"
    | "delete"
    | "history"
    | null;

/* ─────────────────────────────────────
   MOCK DATA
───────────────────────────────────── */
const NOTE_TYPES: NoteType[] = [
    "Progress Note",
    "Intake Assessment",
    "Psychiatric Evaluation",
    "Medication Note",
    "Group Therapy Note",
    "Crisis Assessment",
    "Discharge Summary",
    "Consultation Note",
];

const STAFF_LIST = [
    { id: "STF-001", name: "Dr. Chisom Obi", role: "Psychologist" },
    { id: "STF-002", name: "Dr. Bola Adeyemi", role: "Psychiatrist" },
    { id: "STF-003", name: "Dr. Amaka Kolade", role: "Psychiatrist" },
    { id: "STF-004", name: "Dr. Femi Eze", role: "Counsellor" },
    { id: "STF-005", name: "Nurse Rita Bello", role: "Psychiatric Nurse" },
];

const PATIENTS = [
    { id: "PAT-0142", name: "Amara Okafor", initials: "AO", color: "#2C7A6E", diagnosis: "Major Depressive Disorder" },
    { id: "PAT-0141", name: "Chidi Nwosu", initials: "CN", color: "#6B5ED4", diagnosis: "Generalised Anxiety Disorder" },
    { id: "PAT-0138", name: "Emeka Afolabi", initials: "EA", color: "#C94040", diagnosis: "Bipolar Disorder Type I" },
    { id: "PAT-0135", name: "Ngozi Eze", initials: "NE", color: "#27A76A", diagnosis: "PTSD — Complex Trauma" },
    { id: "PAT-0130", name: "Fatima Hassan", initials: "FH", color: "#D98326", diagnosis: "OCD — Contamination Subtype" },
    { id: "PAT-0128", name: "Kunle Balogun", initials: "KB", color: "#7A9490", diagnosis: "Substance Use Disorder" },
];

interface Note {
    id: string;
    patientId: string;
    title: string;
    type: NoteType;
    status: NoteStatus;
    authorId: string;
    authorName: string;
    signerId: string | null;
    signerName: string | null;
    cosignerId: string | null;
    cosignerName: string | null;
    createdAt: string;
    updatedAt: string;
    signedAt: string | null;
    cosignedAt: string | null;
    content: string;
    version: number;
    tags: string[];
}

const MOCK_NOTES: Note[] = [
    {
        id: "NOTE-001",
        patientId: "PAT-0142",
        title: "CBT Session Progress Note — Week 14",
        type: "Progress Note",
        status: "locked",
        authorId: "STF-002",
        authorName: "Dr. Bola Adeyemi",
        signerId: "STF-002",
        signerName: "Dr. Bola Adeyemi",
        cosignerId: "STF-003",
        cosignerName: "Dr. Amaka Kolade",
        createdAt: "10 Apr 2026",
        updatedAt: "10 Apr 2026",
        signedAt: "10 Apr 2026, 04:15 PM",
        cosignedAt: "10 Apr 2026, 05:00 PM",
        version: 3,
        tags: ["CBT", "Depression", "Homework Review"],
        content: `SUBJECTIVE:
Patient Amara Okafor (PAT-0142) presented for her 14th CBT session. She reports a subjective mood rating of 5/10 this week, compared to 4/10 at last session — a slight improvement. She completed the thought record homework assigned last week, documenting 4 negative automatic thoughts with associated evidence for and against.

She reports improved sleep over the past 5 days, averaging 6–7 hours compared to 4–5 hours previously. Appetite remains suppressed, particularly in the mornings. She denied suicidal ideation, self-harm, or intent.

Notable stressor this week: conflict with her supervisor at work, which she identified as a trigger for a "catastrophising" thought pattern ("I'll lose my job and everything will fall apart").

OBJECTIVE:
Patient appeared well-groomed and appropriately dressed. Affect was mildly restricted but brighter than previous session. Maintained good eye contact. Speech was normal in rate, rhythm, and volume. Thought process was logical and goal-directed. No evidence of psychosis, mania, or cognitive impairment. PHQ-9 administered — score: 16 (moderate, down from 22 at intake).

ASSESSMENT:
Amara continues to demonstrate meaningful engagement with CBT techniques. The reduction in PHQ-9 score from 22 to 16 over 14 sessions reflects genuine symptomatic improvement, particularly in sleep and rumination. Primary challenges remain in behavioural activation and self-compassion.

Identified cognitive distortions this session: catastrophising, mind-reading, and all-or-nothing thinking.

PLAN:
1. Continue weekly CBT sessions — target 10 additional sessions.
2. Homework: Complete a behavioural activation schedule for the coming week; schedule one pleasurable activity daily.
3. Revisit medication compliance at next session — patient reports occasionally skipping evening dose of Sertraline 100mg.
4. Consider adding relaxation training in session 16 if sleep remains disrupted.
5. PHQ-9 to be repeated at session 16.

Next appointment: 17 April 2026, 09:00 AM.`,
    },
    {
        id: "NOTE-002",
        patientId: "PAT-0142",
        title: "Medication Review — Sertraline Titration",
        type: "Medication Note",
        status: "signed",
        authorId: "STF-003",
        authorName: "Dr. Amaka Kolade",
        signerId: "STF-003",
        signerName: "Dr. Amaka Kolade",
        cosignerId: null,
        cosignerName: null,
        createdAt: "01 Apr 2026",
        updatedAt: "01 Apr 2026",
        signedAt: "01 Apr 2026, 02:30 PM",
        cosignedAt: null,
        version: 1,
        tags: ["Medication", "Sertraline", "SSRI"],
        content: `MEDICATION REVIEW NOTE

Patient: Amara Okafor | PAT-0142
Date: 01 April 2026
Reviewing Clinician: Dr. A. Kolade (Psychiatrist)

CURRENT MEDICATIONS:
- Sertraline 100mg — once daily (evening) — for Major Depressive Disorder
- Zopiclone 3.75mg — PRN (max 3× per week) — for insomnia

REASON FOR REVIEW:
Patient-initiated review. Reports partial sleep improvement with Zopiclone but concerns about dependency. Also queries whether sertraline dose is adequate given continued low mood.

DISCUSSION:
Patient's response to Sertraline 100mg has been partial — PHQ-9 reduced from 22 to 19 over first 8 weeks. Current dose remains within standard therapeutic range. Given ongoing symptoms, consider titration to 150mg after a further 4-week trial. Discussed risks and benefits with patient; she consented to continued current dose with reassessment at next review.

Regarding Zopiclone: advised on sleep hygiene, progressive relaxation, and the importance of limiting Zopiclone use to no more than 2× per week to prevent dependence. Patient agrees to trial sleep hygiene strategies for 2 weeks.

PLAN:
- Continue Sertraline 100mg OD for 4 weeks; reassess for titration to 150mg at next review.
- Reduce Zopiclone to ≤2× per week PRN.
- Next medication review: 29 April 2026.`,
    },
    {
        id: "NOTE-003",
        patientId: "PAT-0141",
        title: "Psychiatric Evaluation — Initial Assessment",
        type: "Psychiatric Evaluation",
        status: "draft",
        authorId: "STF-003",
        authorName: "Dr. Amaka Kolade",
        signerId: null,
        signerName: null,
        cosignerId: null,
        cosignerName: null,
        createdAt: "12 Apr 2026",
        updatedAt: "12 Apr 2026",
        signedAt: null,
        cosignedAt: null,
        version: 1,
        tags: ["Initial", "GAD", "Anxiety"],
        content: `PSYCHIATRIC EVALUATION — INITIAL ASSESSMENT

Patient: Chidi Nwosu | PAT-0141
DOB: 07 June 1996 | Age: 28
Date of Evaluation: 12 April 2026
Evaluating Clinician: Dr. A. Kolade (Psychiatrist)

REFERRAL SOURCE:
Self-referred following recommendation by primary care physician, Dr. Osei, following 3 months of escalating anxiety symptoms.

CHIEF COMPLAINT:
"I can't stop worrying. It's affecting my work and my relationship."

HISTORY OF PRESENTING ILLNESS:
Mr. Nwosu presents with a 4-month history of persistent, excessive worry that he finds difficult to control. Worry content focuses primarily on work performance, financial stability, and relationship conflicts. He reports associated symptoms including:
- Muscle tension (neck and shoulders, daily)
- Difficulty concentrating ("my mind goes blank")
- Fatigue (persistent, not relieved by sleep)
- Sleep onset insomnia (taking 1–2 hours to fall asleep)
- Irritability (described by partner)

Symptoms began following a job change in December 2025, though patient notes he has "always been a worrier" since adolescence.

PAST PSYCHIATRIC HISTORY:
No prior psychiatric treatment. No previous hospitalisations. Denies history of self-harm or suicidal ideation (past or present).

MEDICAL HISTORY:
Irritable Bowel Syndrome (IBS) — managed with dietary modification. No other significant medical history. No known drug allergies.

FAMILY HISTORY:
Mother: anxiety disorder (untreated). Father: alcohol use history. No family history of psychosis or bipolar disorder.

SOCIAL HISTORY:
Works as a software engineer. In a 3-year relationship. Non-smoker. Alcohol: 2–3 units per week. Denies illicit substance use.

MENTAL STATUS EXAMINATION:
Appearance: Well-groomed, casually dressed. Psychomotor activity mildly increased (leg tapping, hand wringing observed). 
Speech: Normal rate and volume; slightly pressured at times when discussing work stressors.
Mood: "Anxious most of the time." Affect: Anxious, restricted range. Congruent with mood.
Thought process: Logical, coherent. Ruminative content noted.
Thought content: Preoccupied with worry. Denies obsessions, paranoia, or delusions. Denies suicidal or homicidal ideation.
Perceptions: No hallucinations reported or observed.
Cognition: Alert and fully oriented. Concentration mildly impaired (consistent with anxiety). Memory grossly intact.
Insight: Good. Judgment: Intact.

PROVISIONAL DIAGNOSIS:
Generalised Anxiety Disorder (GAD) — F41.1 (ICD-10)
Rule out: Social Anxiety Disorder component

FORMULATION:
[DRAFT — To be completed prior to signing]

PLAN:
[DRAFT — To be completed prior to signing]`,
    },
    {
        id: "NOTE-004",
        patientId: "PAT-0138",
        title: "Lithium Toxicity Risk Assessment — Urgent",
        type: "Crisis Assessment",
        status: "locked",
        authorId: "STF-003",
        authorName: "Dr. Amaka Kolade",
        signerId: "STF-003",
        signerName: "Dr. Amaka Kolade",
        cosignerId: "STF-002",
        cosignerName: "Dr. Bola Adeyemi",
        createdAt: "09 Apr 2026",
        updatedAt: "09 Apr 2026",
        signedAt: "09 Apr 2026, 06:45 PM",
        cosignedAt: "09 Apr 2026, 07:10 PM",
        version: 2,
        tags: ["Crisis", "Lithium", "Toxicity", "Bipolar", "Urgent"],
        content: `CRISIS ASSESSMENT NOTE — URGENT

Patient: Emeka Afolabi | PAT-0138
Date: 09 April 2026 | Time: 16:30
Assessing Clinician: Dr. A. Kolade (Psychiatrist)
Note: HIPAA RESTRICTED — Sensitive Clinical Information

REASON FOR ASSESSMENT:
Nursing staff alerted psychiatry following patient complaint of tremor, nausea, and "feeling foggy." Patient is currently on Lithium 1200mg daily (titrated 3 weeks ago from 900mg). Serum lithium level drawn — PENDING at time of initial assessment.

PRESENTATION:
Patient found sitting in Day Room. Appeared mildly distressed. Tremor of both hands observed — fine resting tremor, moderate amplitude. Patient reported: "My hands have been shaking since this morning. I feel sick and my head is thick."

VITAL SIGNS (taken by Nurse R. Bello at 16:20):
- BP: 110/72 mmHg (low-normal for patient)
- HR: 88 bpm
- Temp: 37.1°C
- SpO2: 98%

NEUROLOGICAL SCREEN:
Mild confusion — patient scored 7/10 on abbreviated mental test (baseline 10/10 per last assessment). Ataxia not demonstrated on brief gait assessment. Reflexes grossly intact.

CURRENT LITHIUM DOSE: 1200mg daily (carbonate, divided doses)
LAST DOSE: This morning (09:00)
LAST SERUM LEVEL (4 weeks ago): 0.7 mmEq/L (therapeutic range 0.6–1.2)

RISK ASSESSMENT:
Clinical picture is consistent with early lithium toxicity (tremor, GI symptoms, mild cognitive clouding). Risk is MODERATE — patient is ambulatory, haemodynamically stable, and cognition mildly impaired.

IMMEDIATE ACTIONS TAKEN:
1. Lithium dose withheld pending serum level result.
2. IV access established — IV fluids (0.9% NaCl) commenced at 125ml/hr.
3. Serum lithium, U&E, creatinine, and eGFR urgently requested.
4. ECG ordered — result pending.
5. Patient moved to monitored bay in clinical wing.
6. Nephrologist on call notified.
7. Family member (son, Chukwuemeka Afolabi) contacted and informed.

PLAN:
- Await serum lithium result urgently.
- If level >1.5 mEq/L: consider medical transfer for haemodialysis.
- If level 1.2–1.5 mEq/L: continue IV fluids, close monitoring, hold lithium.
- Reassess in 2 hours or sooner if clinical deterioration.
- Consider dose reduction to 900mg daily once stable.
- Document outcome in follow-up note.

SERUM LEVEL RESULT (received 17:45): 1.38 mEq/L — ELEVATED (above therapeutic range). Management as per plan above.

OUTCOME:
Patient stabilised overnight with IV fluids and lithium held. Level rechecked at 06:00 on 10 April: 0.91 mEq/L. Patient clinically improved — tremor reduced, confusion resolved. Lithium restarted at 900mg daily. Cardiology and nephrology to review today.`,
    },
    {
        id: "NOTE-005",
        patientId: "PAT-0135",
        title: "EMDR Session — Phase 3 Desensitisation",
        type: "Progress Note",
        status: "signed",
        authorId: "STF-001",
        authorName: "Dr. Chisom Obi",
        signerId: "STF-001",
        signerName: "Dr. Chisom Obi",
        cosignerId: null,
        cosignerName: null,
        createdAt: "11 Apr 2026",
        updatedAt: "11 Apr 2026",
        signedAt: "11 Apr 2026, 05:20 PM",
        cosignedAt: null,
        version: 2,
        tags: ["EMDR", "PTSD", "Trauma", "Desensitisation"],
        content: `EMDR SESSION PROGRESS NOTE — PHASE 3: DESENSITISATION

Patient: Ngozi Eze | PAT-0135
Session Number: 11 | Date: 11 April 2026
Therapist: Dr. Chisom Obi (Psychologist)
Session Duration: 90 minutes

PRE-SESSION CHECK-IN:
Ngozi presented punctually. Reported feeling "nervous but ready." Subjective distress level 6/10. Sleep: 5–6 hours (improved from 4 hours at last session). No nightmares reported this week (compared to 3–4 per week previously — significant improvement).

Target memory selected (established in Phase 2): The incident from March 2024. Image identified: "the moment it happened."

EMDR PROCESSING:
SUD (Subjective Units of Disturbance): 8/10 at session start.
Negative Cognition: "I am powerless." 
Positive Cognition: "I did what I could to survive."
VoC (Validity of Cognition): 2/7 (low — expected at this stage).

Bilateral stimulation commenced (auditory; patient preferred this modality). 

Set 1 (25 passes): Patient reported "seeing flashes." SUD 8/10 unchanged.
Set 2 (25 passes): Patient became tearful — reported seeing herself "from above." Allowed brief processing pause. SUD 7/10.
Set 3 (30 passes): Patient reported "it feels further away." SUD 5/10.
Set 4 (25 passes): Patient stated "I feel sad but not as scared." SUD 4/10.

Session concluded with grounding: container exercise and safe place visualisation. SUD at session end: 3/10. VoC for positive cognition: 4/7 (increased from 2/7).

ASSESSMENT:
Meaningful desensitisation occurring. Patient demonstrating capacity to process traumatic material without dissociation. Reduction in SUD from 8 to 3 in one session is clinically significant. Continued reduction in nightmares suggests neurological reprocessing is underway.

PLAN:
- Continue Phase 3 (desensitisation) — same target memory — at Session 12.
- If SUD reaches 0–1, progress to Phase 4 (installation).
- Monitor for post-session affect — patient advised to contact clinic if distress escalates between sessions.
- Safety plan reviewed and updated.

Next session: 18 April 2026.`,
    },
    {
        id: "NOTE-006",
        patientId: "PAT-0130",
        title: "OCD ERP Session — Contamination Protocol Week 6",
        type: "Progress Note",
        status: "draft",
        authorId: "STF-002",
        authorName: "Dr. Bola Adeyemi",
        signerId: null,
        signerName: null,
        cosignerId: null,
        cosignerName: null,
        createdAt: "08 Apr 2026",
        updatedAt: "08 Apr 2026",
        signedAt: null,
        cosignedAt: null,
        version: 1,
        tags: ["OCD", "ERP", "Contamination", "Exposure"],
        content: `ERP SESSION NOTE — CONTAMINATION OCD PROTOCOL (WEEK 6)

Patient: Fatima Hassan | PAT-0130
Session: 11 | Date: 08 April 2026
Therapist: Dr. Bola Adeyemi (Psychiatrist)

SUBJECTIVE:
[DRAFT — Session notes in progress]

Patient reports moderate anxiety this week related to a visit to a hospital with her mother. She was unable to avoid touching door handles and reports she subsequently performed decontamination rituals for approximately 2 hours — a regression from 30-minute ritual duration achieved last week.

However, she also reports successfully completing the homework exposure (touching a supermarket trolley and delaying rituals for 45 minutes). Y-BOCS self-report: 18/40 (down from 22/40 at baseline — 18% reduction).

OBJECTIVE:
[DRAFT — To be completed]

ASSESSMENT:
[DRAFT — To be completed]

PLAN:
[DRAFT — To be completed before signing]`,
    },
    {
        id: "NOTE-007",
        patientId: "PAT-0141",
        title: "Intake Assessment — Group Therapy Orientation",
        type: "Intake Assessment",
        status: "signed",
        authorId: "STF-004",
        authorName: "Dr. Femi Eze",
        signerId: "STF-004",
        signerName: "Dr. Femi Eze",
        cosignerId: null,
        cosignerName: null,
        createdAt: "14 Apr 2026",
        updatedAt: "14 Apr 2026",
        signedAt: "14 Apr 2026, 03:10 PM",
        cosignedAt: null,
        version: 1,
        tags: ["Group Therapy", "Anxiety", "Intake", "Orientation"],
        content: `GROUP THERAPY INTAKE ASSESSMENT — ANXIETY SUPPORT CIRCLE

Patient: Chidi Nwosu | PAT-0141
Date: 14 April 2026
Assessing Clinician: Dr. Femi Eze (Counsellor)

PURPOSE:
This intake assessment was conducted to determine suitability for the Group Anxiety Support Circle programme (PRG-005) and to orient Mr. Nwosu to the group therapy process.

SUITABILITY SCREENING:
Group therapy contraindications reviewed. Patient denies: active psychosis, current suicidal crisis, severe personality pathology that would disrupt group function, or inability to maintain confidentiality. No contraindications identified.

Patient expressed some hesitation about sharing personal information in a group setting ("I'm quite private") but was receptive to the rationale for group therapy. Psychoeducation provided on the therapeutic value of shared experience, normalisation, and peer support.

GOALS IDENTIFIED BY PATIENT:
1. "I want to feel less anxious at work presentations."
2. "I'd like to learn how to stop my mind from racing before bed."
3. "I want tools to handle conflict without shutting down."

GROUP EXPECTATIONS DISCUSSED:
- Confidentiality boundaries
- Session attendance expectations (≥80%)
- Communication of absences to group facilitator
- No recording of sessions
- Respect for other group members

PATIENT AGREEMENT:
Patient agreed to group guidelines and signed the Group Therapy Informed Consent form (documented in compliance folder).

RECOMMENDATION:
Enrol in Group Anxiety Support Circle (PRG-005, commencing 21 April 2026). Concurrent individual sessions with Dr. Kolade to continue.`,
    },
    {
        id: "NOTE-008",
        patientId: "PAT-0128",
        title: "SUD Counselling — Relapse Risk Review",
        type: "Progress Note",
        status: "draft",
        authorId: "STF-004",
        authorName: "Dr. Femi Eze",
        signerId: null,
        signerName: null,
        cosignerId: null,
        cosignerName: null,
        createdAt: "14 Apr 2026",
        updatedAt: "14 Apr 2026",
        signedAt: null,
        cosignedAt: null,
        version: 1,
        tags: ["SUD", "Relapse", "Risk Assessment", "Alcohol"],
        content: `SUD COUNSELLING SESSION — RELAPSE RISK REVIEW

Patient: Kunle Balogun | PAT-0128
Session: 9 | Date: 14 April 2026
Counsellor: Dr. Femi Eze

CONTEXT:
Patient missed his last two scheduled appointments (2 April and 8 April 2026). Today's session was rescheduled by the patient following a welfare call from Nurse R. Bello on 12 April. This is noted as a potential early warning sign.

[DRAFT — Session conducted. Notes to be completed and signed before close of day 14 April 2026]

Key points to document:
- Patient admitted to a "slip" — consumed 3 units of alcohol on the evening of 6 April following an argument with his partner
- Does not consider this a full relapse ("I stopped after 3 drinks, I recognised it")
- AUDIT score administered: 8 (hazardous drinking — threshold met)
- Discussed triggers: relationship conflict, financial pressure, isolation
- Safety plan reviewed and updated
- Crisis contact re-confirmed: partner (Yetunde Balogun, 0803 500 1212) and sponsor (AA)
- Next session scheduled: 21 April 2026 (mandatory attendance — escalation if missed)`,
    },
];

// Version history mock
const VERSION_HISTORY: Record<string, Array<{
    version: number;
    action: string;
    actor: string;
    timestamp: string;
    delta: string;
}>> = {
    "NOTE-001": [
        { version: 1, action: "Created", actor: "Dr. Bola Adeyemi", timestamp: "10 Apr 2026, 10:15 AM", delta: "Note created as draft." },
        { version: 2, action: "Edited", actor: "Dr. Bola Adeyemi", timestamp: "10 Apr 2026, 03:45 PM", delta: "Updated PHQ-9 score, added medication compliance concern to Plan section." },
        { version: 3, action: "Signed", actor: "Dr. Bola Adeyemi", timestamp: "10 Apr 2026, 04:15 PM", delta: "Note signed by author. Status moved to Signed." },
        { version: 3, action: "Co-signed (Locked)", actor: "Dr. Amaka Kolade", timestamp: "10 Apr 2026, 05:00 PM", delta: "Supervisor co-sign applied. Note permanently locked. HIPAA audit trail active." },
    ],
    "NOTE-004": [
        { version: 1, action: "Created", actor: "Dr. Amaka Kolade", timestamp: "09 Apr 2026, 04:45 PM", delta: "Urgent crisis note created." },
        { version: 2, action: "Edited", actor: "Dr. Amaka Kolade", timestamp: "09 Apr 2026, 06:30 PM", delta: "Added serum level result (1.38 mEq/L) and outcome update." },
        { version: 2, action: "Signed", actor: "Dr. Amaka Kolade", timestamp: "09 Apr 2026, 06:45 PM", delta: "Note signed by author." },
        { version: 2, action: "Co-signed (Locked)", actor: "Dr. Bola Adeyemi", timestamp: "09 Apr 2026, 07:10 PM", delta: "Supervisor co-sign applied. Note permanently locked." },
    ],
    "NOTE-005": [
        { version: 1, action: "Created", actor: "Dr. Chisom Obi", timestamp: "11 Apr 2026, 02:00 PM", delta: "Session note created." },
        { version: 2, action: "Edited", actor: "Dr. Chisom Obi", timestamp: "11 Apr 2026, 05:10 PM", delta: "Added post-session SUD reading and VoC update." },
        { version: 2, action: "Signed", actor: "Dr. Chisom Obi", timestamp: "11 Apr 2026, 05:20 PM", delta: "Note signed by author." },
    ],
};

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const statusConfig: Record<NoteStatus, { label: string; chip: string; dot: string; icon: string }> = {
    draft: { label: "Draft", chip: "chip-pending", dot: "var(--warning)", icon: "✏️" },
    signed: { label: "Signed", chip: "chip-active", dot: "var(--success)", icon: "✅" },
    locked: { label: "Locked", chip: "chip-progress", dot: "var(--purple)", icon: "🔒" },
};

const noteTypeIcon: Record<NoteType, string> = {
    "Progress Note": "📋",
    "Intake Assessment": "📝",
    "Psychiatric Evaluation": "🧠",
    "Medication Note": "💊",
    "Group Therapy Note": "🫂",
    "Crisis Assessment": "⚠️",
    "Discharge Summary": "🏁",
    "Consultation Note": "💬",
};

const noteTypeBg: Record<NoteType, { bg: string; color: string }> = {
    "Progress Note": { bg: "var(--primary-light)", color: "var(--primary)" },
    "Intake Assessment": { bg: "var(--success-light)", color: "var(--success)" },
    "Psychiatric Evaluation": { bg: "var(--purple-light)", color: "var(--purple)" },
    "Medication Note": { bg: "#E8F4FD", color: "#1a6fa8" },
    "Group Therapy Note": { bg: "var(--primary-xlight)", color: "var(--primary-mid)" },
    "Crisis Assessment": { bg: "var(--danger-light)", color: "var(--danger)" },
    "Discharge Summary": { bg: "#F0F0F0", color: "#555" },
    "Consultation Note": { bg: "var(--warning-light)", color: "var(--warning)" },
};

/* ─────────────────────────────────────
   PIN INPUT COMPONENT
───────────────────────────────────── */
function PinInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
    const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

    const handleInput = (i: number, v: string) => {
        if (!/^\d*$/.test(v)) return;
        const digits = value.split("");
        digits[i] = v.slice(-1);
        const next = digits.join("");
        onChange(next);
        if (v && i < 5) refs[i + 1]?.current?.focus();
    };

    const handleKey = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1]?.current?.focus();
    };

    return (
        <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "20px 0" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={refs[i]}
                    type="password"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={e => handleInput(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    disabled={disabled}
                    style={{
                        width: 48,
                        height: 56,
                        borderRadius: 12,
                        border: `2px solid ${value[i] ? "var(--primary)" : "var(--border)"}`,
                        background: value[i] ? "var(--primary-light)" : "var(--surface)",
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--fg)",
                        textAlign: "center",
                        outline: "none",
                        transition: "all 0.15s",
                        cursor: disabled ? "not-allowed" : "text",
                    }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────
   CREATE / EDIT NOTE MODAL
───────────────────────────────────── */
function NoteEditorModal({
                             note,
                             onClose,
                             onSave,
                         }: {
    note: Note | null; // null = create new
    onClose: () => void;
    onSave: () => void;
}) {
    const isEdit = !!note;
    const [form, setForm] = useState({
        patientId: note?.patientId || "",
        type: note?.type || ("Progress Note" as NoteType),
        title: note?.title || "",
        tags: note?.tags.join(", ") || "",
        content: note?.content || "",
    });
    const [saving, setSaving] = useState(false);
    const [wordCount, setWordCount] = useState(form.content.split(/\s+/).filter(Boolean).length);

    const handleContent = (v: string) => {
        setForm(p => ({ ...p, content: v }));
        setWordCount(v.split(/\s+/).filter(Boolean).length);
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); onSave(); }, 900);
    };

    const patient = PATIENTS.find(p => p.id === form.patientId);

    return (
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18,
                width: "100%", maxWidth: 800, maxHeight: "90vh", overflow: "hidden",
                boxShadow: "0 32px 80px rgba(25,40,37,0.22)",
                display: "flex", flexDirection: "column",
            }}>
                {/* Header */}
                <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>
                            {isEdit ? "Edit Clinical Note" : "New Clinical Note"}
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                            {isEdit ? `Editing draft — Version ${note!.version}` : "Compose a new clinical note. It will be saved as a draft."}
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {isEdit && (
                            <div style={{ background: "var(--warning-light)", border: "1px solid var(--warning)", borderRadius: 8, padding: "5px 12px", fontSize: 11.5, fontWeight: 700, color: "var(--warning)", fontFamily: "'Space Mono', monospace" }}>
                                ⚠️ Edit creates a new version snapshot
                            </div>
                        )}
                        <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflow: "auto", padding: "22px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Row 1: Patient + Type */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Patient</label>
                            <select
                                className="form-input"
                                value={form.patientId}
                                onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))}
                                style={{ cursor: "pointer" }}
                                disabled={isEdit}
                            >
                                <option value="">Select patient</option>
                                {PATIENTS.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} — {p.id}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Note Type</label>
                            <select
                                className="form-input"
                                value={form.type}
                                onChange={e => setForm(p => ({ ...p, type: e.target.value as NoteType }))}
                                style={{ cursor: "pointer" }}
                            >
                                {NOTE_TYPES.map(t => (
                                    <option key={t} value={t}>{noteTypeIcon[t]} {t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Note Title</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="e.g. CBT Session Progress Note — Week 14"
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        />
                    </div>

                    {/* Tags */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tags <span style={{ fontWeight: 400, color: "var(--muted)" }}>(comma-separated, optional)</span></label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="e.g. CBT, Depression, Homework Review"
                            value={form.tags}
                            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                        />
                    </div>

                    {/* Patient context banner */}
                    {patient && (
                        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: patient.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{patient.initials}</div>
                            <div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{patient.name}</span>
                                <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{patient.diagnosis}</span>
                            </div>
                            <span style={{ marginLeft: "auto", fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 8px", borderRadius: 5, fontWeight: 700 }}>{patient.id}</span>
                        </div>
                    )}

                    {/* Content editor */}
                    <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Note Content</label>
                            <div style={{ display: "flex", gap: 6 }}>
                                {/* Quick template chips */}
                                {["S:", "O:", "A:", "P:"].map(section => (
                                    <button
                                        key={section}
                                        onClick={() => handleContent(form.content + (form.content ? "\n\n" : "") + `${section}\n`)}
                                        style={{ padding: "3px 9px", border: "1.5px solid var(--border)", borderRadius: 6, background: "var(--card)", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "var(--primary)", fontFamily: "'Space Mono', monospace" }}
                                    >{section}</button>
                                ))}
                                <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", alignSelf: "center" }}>{wordCount} words</span>
                            </div>
                        </div>
                        <textarea
                            className="form-input"
                            value={form.content}
                            onChange={e => handleContent(e.target.value)}
                            rows={16}
                            placeholder={`Start writing the clinical note...\n\nTip: Use S: O: A: P: buttons above for SOAP format, or write in your own structure.`}
                            style={{ resize: "none", fontFamily: "'Space Mono', monospace", fontSize: 12.5, lineHeight: 1.8, minHeight: 320 }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                        💡 Saved as <strong style={{ color: "var(--fg)" }}>draft</strong> — sign separately when complete
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                        <button onClick={handleSave} disabled={saving || !form.patientId || !form.title || !form.content} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: (!form.patientId || !form.title || !form.content) ? "var(--border)" : "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", cursor: (!form.patientId || !form.title || !form.content) ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)", opacity: saving ? 0.8 : 1 }}>
                            {saving ? "Saving…" : isEdit ? "Save Changes" : "Save as Draft"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   VIEW NOTE MODAL
───────────────────────────────────── */
function ViewNoteModal({
                           note,
                           onClose,
                           onEdit,
                           onSign,
                           onCosign,
                           onDelete,
                           onHistory,
                       }: {
    note: Note;
    onClose: () => void;
    onEdit: () => void;
    onSign: () => void;
    onCosign: () => void;
    onDelete: () => void;
    onHistory: () => void;
}) {
    const patient = PATIENTS.find(p => p.id === note.patientId)!;
    const config = statusConfig[note.status];
    const typeStyle = noteTypeBg[note.type];

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 860, maxHeight: "92vh", overflow: "hidden", boxShadow: "0 32px 80px rgba(25,40,37,0.22)", display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Note type pill */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 15 }}>{noteTypeIcon[note.type]}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, ...typeStyle, fontFamily: "'Space Mono', monospace" }}>{note.type}</span>
                                <span className={`chip ${config.chip}`}>{config.label}</span>
                                {note.status === "locked" && (
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "var(--purple-light)", color: "var(--purple)", fontFamily: "'Space Mono', monospace" }}>HIPAA LOCKED</span>
                                )}
                            </div>
                            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.3 }}>{note.title}</h2>
                            {/* Metadata row */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: patient.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 8, fontWeight: 700, color: "#fff" }}>{patient.initials}</div>
                  <span style={{ color: "var(--fg)", fontWeight: 700 }}>{patient.name}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--primary)", background: "var(--primary-light)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>{patient.id}</span>
                </span>
                                <span style={{ color: "var(--muted)" }}>Author: <strong style={{ color: "var(--fg)" }}>{note.authorName}</strong></span>
                                <span style={{ color: "var(--muted)" }}>Created: <strong style={{ color: "var(--fg)" }}>{note.createdAt}</strong></span>
                                {note.signedAt && <span style={{ color: "var(--muted)" }}>Signed: <strong style={{ color: "var(--success)" }}>{note.signedAt}</strong></span>}
                                {note.cosignedAt && <span style={{ color: "var(--muted)" }}>Co-signed: <strong style={{ color: "var(--purple)" }}>{note.cosignedAt}</strong></span>}
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>v{note.version} · {note.id}</span>
                            </div>
                            {/* Tags */}
                            {note.tags.length > 0 && (
                                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                                    {note.tags.map(tag => (
                                        <span key={tag} style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Actions */}
                        <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button onClick={onHistory} style={{ padding: "7px 13px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>🕐 History</button>
                            {note.status === "draft" && <button onClick={onEdit} style={{ padding: "7px 13px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>✏️ Edit</button>}
                            {note.status === "draft" && <button onClick={onSign} style={{ padding: "7px 13px", border: "1.5px solid var(--success)", borderRadius: 8, background: "var(--success-light)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--success)", fontFamily: "'Nunito', sans-serif" }}>✍️ Sign</button>}
                            {note.status === "signed" && <button onClick={onCosign} style={{ padding: "7px 13px", border: "1.5px solid var(--purple)", borderRadius: 8, background: "var(--purple-light)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--purple)", fontFamily: "'Nunito', sans-serif" }}>🔒 Co-sign</button>}
                            {note.status === "draft" && <button onClick={onDelete} style={{ padding: "7px 13px", border: "1.5px solid var(--danger)", borderRadius: 8, background: "var(--danger-light)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--danger)", fontFamily: "'Nunito', sans-serif" }}>🗑️ Delete</button>}
                            <button onClick={onClose} style={{ width: 34, height: 34, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                    </div>
                </div>

                {/* Signature strip */}
                {(note.signerId || note.cosignerId) && (
                    <div style={{ padding: "10px 28px", background: note.status === "locked" ? "var(--purple-light)" : "var(--success-light)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                        {note.signerId && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                                <span style={{ fontSize: 14 }}>✅</span>
                                <span style={{ color: "var(--fg-mid)" }}>Signed by <strong style={{ color: "var(--fg)" }}>{note.signerName}</strong> on {note.signedAt}</span>
                            </div>
                        )}
                        {note.cosignerId && (
                            <>
                                <div style={{ width: 1, height: 16, background: "rgba(0,0,0,0.1)" }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                                    <span style={{ fontSize: 14 }}>🔒</span>
                                    <span style={{ color: "var(--fg-mid)" }}>Co-signed by <strong style={{ color: "var(--fg)" }}>{note.cosignerName}</strong> on {note.cosignedAt}</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, overflow: "auto", padding: "28px" }}>
          <pre style={{ fontFamily: "'Space Mono', monospace", fontSize: 12.5, lineHeight: 1.85, color: "var(--fg-mid)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
            {note.content}
          </pre>
                </div>

                {/* Footer */}
                <div style={{ padding: "12px 28px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>
            {note.id} · Version {note.version} · {note.content.split(/\s+/).filter(Boolean).length} words
          </span>
                    <button style={{ padding: "6px 14px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>⬇ Download PDF</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   SIGN NOTE MODAL
───────────────────────────────────── */
function SignNoteModal({
                           note,
                           isCosign,
                           onClose,
                           onSuccess,
                       }: {
    note: Note;
    isCosign: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSign = () => {
        if (pin.length < 6) { setError("Please enter your full 6-digit security PIN."); return; }
        setLoading(true);
        setError("");
        setTimeout(() => {
            setLoading(false);
            if (pin === "123456") { // mock — any 6 digits work in prod
                setSuccess(true);
                setTimeout(onSuccess, 1400);
            } else {
                setError("Incorrect PIN. Please try again. (Hint: use any 6 digits for demo)");
                setPin("");
            }
        }, 1200);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.7)", backdropFilter: "blur(5px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 460, boxShadow: "0 32px 80px rgba(25,40,37,0.28)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)", background: isCosign ? "var(--purple-light)" : "var(--success-light)", textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{isCosign ? "🔒" : "✍️"}</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>
                        {isCosign ? "Supervisor Co-sign" : "Sign Clinical Note"}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
                        {isCosign
                            ? "Co-signing permanently locks this note. This action is irreversible and constitutes a HIPAA audit record."
                            : "Signing confirms accuracy and clinical responsibility. You can still edit a signed note until it is co-signed."}
                    </div>
                </div>

                {success ? (
                    <div style={{ padding: "32px 28px", textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>{isCosign ? "🔐" : "✅"}</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: isCosign ? "var(--purple)" : "var(--success)", marginBottom: 6 }}>
                            {isCosign ? "Note Permanently Locked" : "Note Signed Successfully"}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>
                            {isCosign ? "HIPAA audit trail has been recorded." : "The note is now signed. A supervisor can co-sign to lock it."}
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "24px 28px" }}>
                            {/* Note being signed */}
                            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Signing Note</div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>{note.title}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{note.type} · {note.id}</div>
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--fg-mid)", letterSpacing: "0.06em", marginBottom: 4 }}>
                                    {isCosign ? "SUPERVISOR SECURITY PIN" : "YOUR SECURITY PIN"}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 0 }}>Enter your 6-digit MFA security PIN to confirm</div>
                                <PinInput value={pin} onChange={setPin} disabled={loading} />
                            </div>

                            {error && (
                                <div style={{ background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: 9, padding: "10px 14px", fontSize: 12.5, color: "var(--danger)", fontWeight: 600, textAlign: "center", marginTop: 4 }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <div style={{ marginTop: 16, background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 9, padding: "10px 14px", fontSize: 12, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                                {isCosign
                                    ? "⚠️ Co-signing is permanent and irreversible. Signed & co-signed notes cannot be deleted per HIPAA regulations."
                                    : "ℹ️ Your digital signature constitutes legal clinical documentation. Ensure the note is accurate and complete before signing."}
                            </div>
                        </div>

                        <div style={{ padding: "14px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={onClose} style={{ padding: "10px 18px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                            <button
                                onClick={handleSign}
                                disabled={pin.length < 6 || loading}
                                style={{ padding: "10px 22px", border: "none", borderRadius: 9, background: pin.length === 6 ? (isCosign ? "var(--purple)" : "var(--success)") : "var(--border)", cursor: pin.length === 6 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.8 : 1, transition: "all 0.15s" }}
                            >{loading ? "Verifying…" : isCosign ? "Co-sign & Lock Note" : "Sign Note"}</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────── */
function DeleteNoteModal({ note, onClose, onConfirm }: { note: Note; onClose: () => void; onConfirm: () => void }) {
    const [loading, setLoading] = useState(false);
    const [typed, setTyped] = useState("");
    const confirmWord = "DELETE";

    const handle = () => {
        if (typed !== confirmWord) return;
        setLoading(true);
        setTimeout(() => { setLoading(false); onConfirm(); }, 800);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.7)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden" }}>
                <div style={{ padding: "26px 26px" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 8 }}>Soft-delete Draft Note</div>
                    <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                        You are about to soft-delete the draft note <strong style={{ color: "var(--fg)" }}>"{note.title}"</strong>. This note will be archived and can be recovered by an admin. <strong style={{ color: "var(--danger)" }}>Signed or co-signed notes cannot be deleted.</strong>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Type <strong style={{ fontFamily: "'Space Mono', monospace" }}>DELETE</strong> to confirm</label>
                        <input className="form-input" type="text" value={typed} onChange={e => setTyped(e.target.value)} placeholder="DELETE" style={typed === confirmWord ? { borderColor: "var(--danger)" } : {}} />
                    </div>
                </div>
                <div style={{ padding: "14px 26px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={handle} disabled={typed !== confirmWord || loading} style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: typed === confirmWord ? "var(--danger)" : "var(--border)", cursor: typed === confirmWord ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.7 : 1 }}>{loading ? "Deleting…" : "Delete Note"}</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   VERSION HISTORY MODAL
───────────────────────────────────── */
function VersionHistoryModal({ note, onClose }: { note: Note; onClose: () => void }) {
    const history = VERSION_HISTORY[note.id] || [
        { version: 1, action: "Created", actor: note.authorName, timestamp: `${note.createdAt}, 09:00 AM`, delta: "Note created as draft." },
    ];

    const actionColor = (action: string) => {
        if (action.includes("Locked") || action.includes("Co-sign")) return "var(--purple)";
        if (action === "Signed") return "var(--success)";
        if (action === "Edited") return "var(--warning)";
        return "var(--primary)";
    };

    const actionIcon = (action: string) => {
        if (action.includes("Locked") || action.includes("Co-sign")) return "🔒";
        if (action === "Signed") return "✅";
        if (action === "Edited") return "✏️";
        return "📝";
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 580, maxHeight: "85vh", overflow: "hidden", boxShadow: "0 28px 72px rgba(25,40,37,0.22)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 700, color: "var(--fg)" }}>Version History</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{note.title} · {note.id}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "var(--primary)", fontFamily: "'Space Mono', monospace" }}>HIPAA AUDIT TRAIL</div>
                        <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
                    <div style={{ position: "relative" }}>
                        {/* Timeline line */}
                        <div style={{ position: "absolute", left: 17, top: 24, bottom: 0, width: 2, background: "var(--border)" }} />

                        {history.map((entry, i) => (
                            <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < history.length - 1 ? 24 : 0, position: "relative" }}>
                                {/* Timeline dot */}
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--card)", border: `2px solid ${actionColor(entry.action)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, zIndex: 1 }}>
                                    {actionIcon(entry.action)}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, background: i === history.length - 1 ? "var(--primary-xlight)" : "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: actionColor(entry.action) }}>{entry.action}</span>
                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted)", padding: "1px 7px", borderRadius: 20, fontWeight: 700 }}>v{entry.version}</span>
                                            </div>
                                            <div style={{ fontSize: 12.5, color: "var(--fg-mid)", marginTop: 2, fontWeight: 600 }}>{entry.actor}</div>
                                        </div>
                                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", textAlign: "right" }}>{entry.timestamp}</div>
                                    </div>
                                    <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55 }}>{entry.delta}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* HIPAA note */}
                    <div style={{ marginTop: 20, background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>🛡️</span>
                        <div style={{ fontSize: 12, color: "var(--primary-dark)", lineHeight: 1.6 }}>
                            All edits, signatures, and deletions are permanently recorded in this audit trail as required by HIPAA Security Rule §164.312(b). Audit logs cannot be modified.
                        </div>
                    </div>
                </div>

                <div style={{ padding: "14px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: "9px 20px", border: "none", borderRadius: 9, background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
export default function ClinicalNotesPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);

    const openModal = (type: ModalType, note?: Note) => {
        setSelectedNote(note || null);
        setOpenMenuId(null);
        setModal(type);
    };

    const tabs = [
        { label: "All Notes", count: notes.length },
        { label: "Drafts", count: notes.filter(n => n.status === "draft").length },
        { label: "Signed", count: notes.filter(n => n.status === "signed").length },
        { label: "Locked", count: notes.filter(n => n.status === "locked").length },
    ];

    const filtered = notes.filter(note => {
        const matchTab =
            activeTab === 0 ||
            (activeTab === 1 && note.status === "draft") ||
            (activeTab === 2 && note.status === "signed") ||
            (activeTab === 3 && note.status === "locked");
        const matchSearch = !search || note.title.toLowerCase().includes(search.toLowerCase()) || note.authorName.toLowerCase().includes(search.toLowerCase()) || PATIENTS.find(p => p.id === note.patientId)?.name.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const kpis = [
        { label: "Total Notes", value: String(notes.length), trend: "↑ 3", trendSub: "this week", color: "#2C7A6E", sparkId: "nk1", points: "0,30 16,26 32,22 48,24 64,14 80,16 100,8" },
        { label: "Pending Signature", value: String(notes.filter(n => n.status === "draft").length), trend: "↑ 2", trendSub: "require action", color: "#D98326", sparkId: "nk2", points: "0,26 16,22 32,28 48,18 64,22 80,14 100,18" },
        { label: "Signed Notes", value: String(notes.filter(n => n.status === "signed").length), trend: "✓", trendSub: "awaiting co-sign", color: "#27A76A", sparkId: "nk3", points: "0,34 16,28 32,24 48,20 64,16 80,12 100,8" },
        { label: "Locked (HIPAA)", value: String(notes.filter(n => n.status === "locked").length), trend: "🔒", trendSub: "permanently archived", color: "#6B5ED4", sparkId: "nk4", points: "0,30 16,28 32,26 48,24 64,22 80,20 100,16" },
    ];

    return (
        <>
            {/* ── Modals ── */}
            {openMenuId && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />}

            {modal === "create" && (
                <NoteEditorModal note={null} onClose={() => setModal(null)} onSave={() => setModal(null)} />
            )}
            {modal === "edit" && selectedNote && (
                <NoteEditorModal note={selectedNote} onClose={() => setModal(null)} onSave={() => setModal(null)} />
            )}
            {modal === "view" && selectedNote && (
                <ViewNoteModal
                    note={selectedNote}
                    onClose={() => setModal(null)}
                    onEdit={() => { setModal(null); setTimeout(() => setModal("edit"), 50); }}
                    onSign={() => { setModal(null); setTimeout(() => setModal("sign"), 50); }}
                    onCosign={() => { setModal(null); setTimeout(() => setModal("cosign"), 50); }}
                    onDelete={() => { setModal(null); setTimeout(() => setModal("delete"), 50); }}
                    onHistory={() => { setModal(null); setTimeout(() => setModal("history"), 50); }}
                />
            )}
            {modal === "sign" && selectedNote && (
                <SignNoteModal
                    note={selectedNote}
                    isCosign={false}
                    onClose={() => setModal(null)}
                    onSuccess={() => {
                        setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, status: "signed" as NoteStatus, signedAt: "Now", signerName: "Dr. Amaka Kolade", signerId: "STF-003" } : n));
                        setTimeout(() => setModal(null), 1600);
                    }}
                />
            )}
            {modal === "cosign" && selectedNote && (
                <SignNoteModal
                    note={selectedNote}
                    isCosign={true}
                    onClose={() => setModal(null)}
                    onSuccess={() => {
                        setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, status: "locked" as NoteStatus, cosignedAt: "Now", cosignerName: "Dr. Amaka Kolade", cosignerId: "STF-003" } : n));
                        setTimeout(() => setModal(null), 1600);
                    }}
                />
            )}
            {modal === "delete" && selectedNote && (
                <DeleteNoteModal
                    note={selectedNote}
                    onClose={() => setModal(null)}
                    onConfirm={() => {
                        setNotes(prev => prev.filter(n => n.id !== selectedNote.id));
                        setModal(null);
                    }}
                />
            )}
            {modal === "history" && selectedNote && (
                <VersionHistoryModal note={selectedNote} onClose={() => setModal(null)} />
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Clinical Notes</div>
                    <div className="page-subtitle">SOAP notes, assessments & clinical documentation — HIPAA compliant</div>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => openModal("create")}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}
                    >
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                        New Clinical Note
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                {kpis.map(k => (
                    <div key={k.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 20px 16px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>{k.label}</div>
                            <div style={{ display: "flex", gap: 3 }}>{[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--muted)", display: "inline-block" }} />)}</div>
                        </div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>{k.value}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: k.color }}>{k.trend} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 11.5 }}>{k.trendSub}</span></div>
                        <svg style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.4 }} width="100" height="44" viewBox="0 0 100 44">
                            <defs><linearGradient id={k.sparkId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity="0.3" /><stop offset="100%" stopColor={k.color} stopOpacity="0" /></linearGradient></defs>
                            <polyline points={k.points} fill="none" stroke={k.color} strokeWidth="2" />
                            <polygon points={`${k.points} 100,44 0,44`} fill={`url(#${k.sparkId})`} />
                        </svg>
                    </div>
                ))}
            </div>

            {/* Signature Alert Banner (if drafts pending) */}
            {notes.filter(n => n.status === "draft").length > 0 && (
                <div style={{ background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                    <div style={{ flex: 1, fontSize: 13, color: "var(--fg-mid)", fontWeight: 500 }}>
                        You have <strong style={{ color: "var(--warning)" }}>{notes.filter(n => n.status === "draft").length} unsigned draft note{notes.filter(n => n.status === "draft").length !== 1 ? "s" : ""}</strong> pending signature. Unsigned notes are not legally valid for clinical records.
                    </div>
                    <button onClick={() => setActiveTab(1)} style={{ padding: "7px 14px", border: "1.5px solid var(--warning)", borderRadius: 8, background: "var(--warning-light)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--warning)", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>View Drafts →</button>
                </div>
            )}

            {/* Tabs + Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                {tabs.map((tab, i) => (
                    <button
                        key={tab.label}
                        className={`filter-tab${activeTab === i ? " active" : ""}`}
                        onClick={() => setActiveTab(i)}
                    >
                        {tab.label}
                        <span style={{ marginLeft: 6, fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.75 }}>({tab.count})</span>
                    </button>
                ))}

                {/* Search */}
                <div style={{ marginLeft: "auto", position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 13, pointerEvents: "none" }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search notes, patients, authors…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px 7px 34px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", width: 260, transition: "border-color 0.18s" }}
                        onFocus={e => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                    />
                </div>
            </div>

            {/* Notes Table */}
            <div className="card">
                {filtered.length === 0 ? (
                    <div style={{ padding: 48, textAlign: "center" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>No notes found</div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
                            {search ? `No notes matching "${search}"` : "No notes in this category yet."}
                        </div>
                        <button onClick={() => openModal("create")} style={{ padding: "9px 20px", background: "var(--primary-light)", border: "1.5px solid var(--primary)", borderRadius: 9, color: "var(--primary)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>Create First Note</button>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Note / Patient</th>
                                <th>Type</th>
                                <th>Author</th>
                                <th>Date</th>
                                <th>Version</th>
                                <th>Tags</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" as const }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map(note => {
                                const patient = PATIENTS.find(p => p.id === note.patientId)!;
                                const config = statusConfig[note.status];
                                const typeStyle = noteTypeBg[note.type];

                                return (
                                    <tr key={note.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedNote(note); setModal("view"); }}>
                                        {/* Note + Patient */}
                                        <td>
                                            <div style={{ maxWidth: 280 }}>
                                                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)", marginBottom: 4, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {noteTypeIcon[note.type]} {note.title}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                    <div style={{ width: 18, height: 18, borderRadius: 4, background: patient.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 7, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{patient.initials}</div>
                                                    <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{patient.name}</span>
                                                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, color: "var(--primary)", background: "var(--primary-light)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>{patient.id}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td onClick={e => e.stopPropagation()}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, ...typeStyle, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
                          {note.type}
                        </span>
                                        </td>

                                        {/* Author */}
                                        <td>
                                            <div>
                                                <span className="td-text" style={{ display: "block" }}>{note.authorName}</span>
                                                {note.signerName && note.signerName !== note.authorName && (
                                                    <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>✅ {note.signerName}</span>
                                                )}
                                                {note.cosignerName && (
                                                    <span style={{ fontSize: 11, color: "var(--purple)", fontWeight: 600, display: "block" }}>🔒 {note.cosignerName}</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td><span className="td-mono">{note.createdAt}</span></td>

                                        {/* Version */}
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11.5, fontWeight: 700, color: "var(--fg)" }}>v{note.version}</span>
                                                {VERSION_HISTORY[note.id] && (
                                                    <span
                                                        title="View history"
                                                        onClick={e => { e.stopPropagation(); openModal("history", note); }}
                                                        style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", padding: "1px 6px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}
                                                    >🕐 {VERSION_HISTORY[note.id].length} events</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Tags */}
                                        <td>
                                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 160 }}>
                                                {note.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>#{tag}</span>
                                                ))}
                                                {note.tags.length > 2 && (
                                                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'Space Mono', monospace" }}>+{note.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td onClick={e => e.stopPropagation()}>
                                            <span className={`chip ${config.chip}`}>{config.label}</span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ textAlign: "right" as const }} onClick={e => e.stopPropagation()}>
                                            <div className="dots-menu-wrap" style={{ position: "relative", zIndex: openMenuId === note.id ? 200 : "auto", display: "inline-block" }}>
                                                <button className="dots-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === note.id ? null : note.id); }}>···</button>
                                                <div className={`dots-menu${openMenuId === note.id ? " open" : ""}`} style={{ minWidth: 195 }}>
                                                    <div className="dots-menu-item" onClick={() => openModal("view", note)}><span className="dots-menu-icon">👁</span>View Note</div>
                                                    {note.status === "draft" && (
                                                        <div className="dots-menu-item" onClick={() => openModal("edit", note)}><span className="dots-menu-icon">✏️</span>Edit Draft</div>
                                                    )}
                                                    {note.status === "draft" && (
                                                        <div className="dots-menu-item" style={{ color: "var(--success)" }} onClick={() => openModal("sign", note)}><span className="dots-menu-icon">✅</span>Sign Note</div>
                                                    )}
                                                    {note.status === "signed" && (
                                                        <div className="dots-menu-item" style={{ color: "var(--purple)" }} onClick={() => openModal("cosign", note)}><span className="dots-menu-icon">🔒</span>Co-sign & Lock</div>
                                                    )}
                                                    <div className="dots-menu-item" onClick={() => openModal("history", note)}><span className="dots-menu-icon">🕐</span>Version History</div>
                                                    <div className="dots-menu-item"><span className="dots-menu-icon">⬇</span>Download PDF</div>
                                                    <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                                                    {note.status === "draft" ? (
                                                        <div className="dots-menu-item danger" onClick={() => openModal("delete", note)}><span className="dots-menu-icon">🗑️</span>Soft Delete</div>
                                                    ) : (
                                                        <div className="dots-menu-item" style={{ opacity: 0.4, cursor: "not-allowed" }} title="Signed/locked notes cannot be deleted (HIPAA)"><span className="dots-menu-icon">🔐</span>Cannot Delete</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <button className="page-btn disabled">« Prev</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                            <button className="page-btn">Next »</button>
                            <div style={{ marginLeft: "auto" }}>
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>Showing {filtered.length} of {notes.length} notes</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* HIPAA info strip */}
            <div style={{ marginTop: 16, padding: "12px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🛡️</span>
                <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--fg)" }}>HIPAA Compliance:</strong> All clinical notes are subject to HIPAA Security Rule §164.312(b). Draft notes must be signed by the author to be legally valid. Co-signed notes are permanently locked. Signed and co-signed notes cannot be deleted. All edits and signatures are logged in the immutable audit trail.
                </div>
            </div>
        </>
    );
}