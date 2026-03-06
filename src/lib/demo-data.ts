// Mock data for demo mode (NEXT_PUBLIC_DEMO_MODE=true)
// Used when no Supabase session is present

const today = new Date()
const fmt = (d: Date) => d.toISOString()
const hoursFromNow = (h: number) => fmt(new Date(today.getTime() + h * 3600000))
const daysAgo = (d: number) => fmt(new Date(today.getTime() - d * 86400000))

export const DEMO_COACH_SESSIONS = [
  {
    id: 'demo-s1',
    scheduled_at: hoursFromNow(1),
    status: 'scheduled',
    session_type: 'coaching_call',
    channel: 'google_meet',
    meet_link: 'https://meet.google.com/demo',
    focus_tag: 'Literacy',
    confirmation_status: 'confirmed',
    duration_mins: null,
    summary_sent_at: null,
    next_touch_window: null,
    tech_issue_flag: false,
    teacher_id: 'demo-t1',
    coach_id: 'demo-coach',
    teacher: {
      id: 'demo-t1',
      name: 'Sunita Devi',
      school_name: 'PS Rampur',
      block_tag: 'Sadar',
      phone: '9876543210',
      ryg: { status: 'Y' },
    },
  },
  {
    id: 'demo-s2',
    scheduled_at: hoursFromNow(3),
    status: 'scheduled',
    session_type: 'coaching_call',
    channel: 'google_meet',
    meet_link: 'https://meet.google.com/demo2',
    focus_tag: 'Numeracy',
    confirmation_status: 'pending',
    duration_mins: null,
    summary_sent_at: null,
    next_touch_window: null,
    tech_issue_flag: false,
    teacher_id: 'demo-t2',
    coach_id: 'demo-coach',
    teacher: {
      id: 'demo-t2',
      name: 'Ramesh Kumar',
      school_name: 'PS Shivpur',
      block_tag: 'Sadar',
      phone: '9876543211',
      ryg: { status: 'G' },
    },
  },
  {
    id: 'demo-s3',
    scheduled_at: hoursFromNow(5),
    status: 'scheduled',
    session_type: 'coaching_call',
    channel: 'phone',
    meet_link: null,
    focus_tag: 'Relationship',
    confirmation_status: 'pending',
    duration_mins: null,
    summary_sent_at: null,
    next_touch_window: null,
    tech_issue_flag: false,
    teacher_id: 'demo-t3',
    coach_id: 'demo-coach',
    teacher: {
      id: 'demo-t3',
      name: 'Meena Gupta',
      school_name: 'PS Nandpur',
      block_tag: 'Koraon',
      phone: '9876543212',
      ryg: { status: 'R' },
    },
  },
]

export const DEMO_DUE_ACTIONS = [
  {
    sessionId: 'demo-old-s1',
    teacherName: 'Anita Yadav',
    type: 'incomplete_notes' as const,
    label: 'Notes not completed',
  },
]

export const DEMO_CM_DATA = {
  coaches: [
    { id: 'demo-coach-1', name: 'Priya Sharma' },
    { id: 'demo-coach-2', name: 'Arun Singh' },
    { id: 'demo-coach-3', name: 'Kavita Mishra' },
    { id: 'demo-coach-4', name: 'Deepak Verma' },
  ],
  escalations: [
    {
      id: 'demo-esc-1',
      trigger_type: 'reschedule_threshold',
      teacher: { name: 'Meena Gupta' },
      coach: { name: 'Priya Sharma' },
      auto_created_at: daysAgo(2),
    },
    {
      id: 'demo-esc-2',
      trigger_type: 'manual',
      teacher: { name: 'Ravi Shankar' },
      coach: { name: 'Arun Singh' },
      auto_created_at: daysAgo(1),
    },
  ],
  sessionsByCoach: {
    'demo-coach-1': { completed: 14, noShow: 1 },
    'demo-coach-2': { completed: 11, noShow: 3 },
    'demo-coach-3': { completed: 16, noShow: 0 },
    'demo-coach-4': { completed: 9,  noShow: 2 },
  },
}

export const DEMO_ADMIN_COUNTS = {
  coaches: 4,
  teachers: 144,
  orgUnits: 3,
  rubrics: 1,
}

export const DEMO_VBA_SESSION = {
  id: 'demo-vba-1',
  teacher_id: 'demo-t1',
  teacher: { id: 'demo-t1', name: 'Sunita Devi', school_name: 'PS Rampur', phone: '9876543210' },
  scheduled_at: new Date().toISOString(),
  status: 'scheduled',
  meet_link: 'https://meet.google.com/demo-vba-link',
  protocol_ratings: {},
  checklist_items_done: [],
}

// 3 pre-filled students — workspace opens with some existing data visible
export const DEMO_VBA_RESULTS = [
  { id: 'r1', vba_session_id: 'demo-vba-1', student_number: 1, student_name: 'Student 1',
    literacy_results: { letter_recognition: 'pass', word_reading: 'pass', sentence_reading: 'fail', paragraph_reading: 'fail' },
    numeracy_results: { number_recognition: 'pass', addition: 'pass', subtraction: 'fail', word_problem: 'fail' } },
  { id: 'r2', vba_session_id: 'demo-vba-1', student_number: 2, student_name: 'Student 2',
    literacy_results: { letter_recognition: 'pass', word_reading: 'pass', sentence_reading: 'pass', paragraph_reading: 'fail' },
    numeracy_results: { number_recognition: 'pass', addition: 'pass', subtraction: 'pass', word_problem: 'fail' } },
  { id: 'r3', vba_session_id: 'demo-vba-1', student_number: 3, student_name: 'Student 3',
    literacy_results: { letter_recognition: 'pass', word_reading: 'fail', sentence_reading: 'fail', paragraph_reading: 'fail' },
    numeracy_results: { number_recognition: 'pass', addition: 'fail', subtraction: 'fail', word_problem: 'fail' } },
]
