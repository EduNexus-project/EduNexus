import {
  Student,
  Teacher,
  AcademicClass,
  Anomaly,
  ModificationRequest,
  StudentMarkReport,
  CampusBlockHeatmap,
  NotificationItem,
  AttendanceRecord
} from '../types';

export const INITIAL_CLASSES: AcademicClass[] = [
  {
    id: 'cls_cse_a',
    code: 'CSE-3A',
    name: 'B.Tech CSE - Semester 6 (Section A)',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    classTeacherId: 'usr_teacher_01',
    classTeacherName: 'Prof. Anitha Vasudevan',
    totalStudents: 38,
    todaysFnRate: 94.7,
    todaysAnRate: 81.6,
    overallRate: 88.2,
    roomNumber: 'LH-302',
    block: 'Aryabhata Computing Centre'
  },
  {
    id: 'cls_cse_b',
    code: 'CSE-3B',
    name: 'B.Tech CSE - Semester 6 (Section B)',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'B',
    classTeacherId: 'usr_teacher_02',
    classTeacherName: 'Dr. K. S. Ramanathan',
    totalStudents: 40,
    todaysFnRate: 92.5,
    todaysAnRate: 85.0,
    overallRate: 87.5,
    roomNumber: 'LH-304',
    block: 'Aryabhata Computing Centre'
  },
  {
    id: 'cls_aids_a',
    code: 'AIDS-2A',
    name: 'B.Tech AI & Data Science - Sem 4 (A)',
    department: 'Artificial Intelligence & Data Science',
    semester: 4,
    section: 'A',
    classTeacherId: 'usr_teacher_03',
    classTeacherName: 'Dr. Meenakshi Sundaram',
    totalStudents: 36,
    todaysFnRate: 97.2,
    todaysAnRate: 94.4,
    overallRate: 93.8,
    roomNumber: 'LH-401',
    block: 'Ramanujan Mathematical Science'
  },
  {
    id: 'cls_ece_a',
    code: 'ECE-3A',
    name: 'B.Tech ECE - Semester 6 (Section A)',
    department: 'Electronics & Communication',
    semester: 6,
    section: 'A',
    classTeacherId: 'usr_teacher_04',
    classTeacherName: 'Prof. Vikramaditya Reddy',
    totalStudents: 34,
    todaysFnRate: 88.2,
    todaysAnRate: 76.5,
    overallRate: 82.4,
    roomNumber: 'VLSI-201',
    block: 'Sir C.V. Raman Physics & Tech'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_01',
    rollNumber: '21CS101',
    name: 'Aarav Kumar',
    email: 'aarav.21cs@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    section: 'A',
    department: 'Computer Science',
    semester: 6,
    parentName: 'Suresh Kumar',
    parentPhone: '+91 98840 55667',
    parentEmail: 'suresh.kumar@gmail.com',
    fnAttendanceRate: 95.8,
    anAttendanceRate: 79.2, // Anomaly: Afternoon skipping!
    overallAttendanceRate: 87.5,
    academicCgpa: 8.64,
    riskLevel: 'medium',
    tags: ['Hosteller', 'Placement Eligible', 'FN-AN Disparity']
  },
  {
    id: 'std_02',
    rollNumber: '21CS102',
    name: 'Pooja Narayanan',
    email: 'pooja.21cs@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    section: 'A',
    department: 'Computer Science',
    semester: 6,
    parentName: 'Narayanan R',
    parentPhone: '+91 98401 22334',
    parentEmail: 'narayanan.r@yahoo.com',
    fnAttendanceRate: 98.2,
    anAttendanceRate: 97.4,
    overallAttendanceRate: 97.8,
    academicCgpa: 9.42,
    riskLevel: 'low',
    tags: ['Department Rank 1', 'IEEE Student Chair']
  },
  {
    id: 'std_03',
    rollNumber: '21CS103',
    name: 'Rohan Deshmukh',
    email: 'rohan.21cs@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    section: 'A',
    department: 'Computer Science',
    semester: 6,
    parentName: 'Sunil Deshmukh',
    parentPhone: '+91 94451 88990',
    parentEmail: 'sunil.deshmukh@gmail.com',
    fnAttendanceRate: 74.0,
    anAttendanceRate: 62.5,
    overallAttendanceRate: 68.25,
    academicCgpa: 6.45,
    riskLevel: 'high',
    tags: ['Critical Attendance (<75%)', 'Medical Leave Submitted']
  },
  {
    id: 'std_04',
    rollNumber: '21CS104',
    name: 'Sneha Venkatesan',
    email: 'sneha.21cs@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    section: 'A',
    department: 'Computer Science',
    semester: 6,
    parentName: 'Venkatesan K',
    parentPhone: '+91 98841 99221',
    parentEmail: 'venkat.k@gmail.com',
    fnAttendanceRate: 92.5,
    anAttendanceRate: 91.0,
    overallAttendanceRate: 91.75,
    academicCgpa: 8.95,
    riskLevel: 'low',
    tags: ['Sports Quota - Badminton', 'Merit Scholar']
  },
  {
    id: 'std_05',
    rollNumber: '21CS105',
    name: 'Vikram Aditya',
    email: 'vikram.21cs@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    section: 'A',
    department: 'Computer Science',
    semester: 6,
    parentName: 'Chandrasekhar A',
    parentPhone: '+91 94440 66778',
    parentEmail: 'chandra.a@gmail.com',
    fnAttendanceRate: 85.0,
    anAttendanceRate: 68.0,
    overallAttendanceRate: 76.5,
    academicCgpa: 7.20,
    riskLevel: 'high',
    tags: ['Session Skipping Pattern', 'Lab Absentee']
  },
  {
    id: 'std_06',
    rollNumber: '21CS106',
    name: 'Ananya Raghavan',
    email: 'ananya.21cs@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    section: 'A',
    department: 'Computer Science',
    semester: 6,
    parentName: 'Raghavan S',
    parentPhone: '+91 98409 33221',
    parentEmail: 'raghavan.s@gmail.com',
    fnAttendanceRate: 96.0,
    anAttendanceRate: 95.0,
    overallAttendanceRate: 95.5,
    academicCgpa: 9.12,
    riskLevel: 'low',
    tags: ['Coding Club Lead']
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'usr_teacher_01',
    employeeCode: 'FAC-CS-042',
    name: 'Prof. Anitha Vasudevan',
    email: 'anitha.v@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & Class Incharge',
    phone: '+91 98402 33445',
    assignedClasses: ['cls_cse_a'],
    subjectsTaught: ['CS601: Distributed Systems', 'CS604: Cloud Computing Lab']
  },
  {
    id: 'usr_teacher_02',
    employeeCode: 'FAC-CS-019',
    name: 'Dr. K. S. Ramanathan',
    email: 'ramanathan.ks@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    designation: 'Professor & Head of Department',
    phone: '+91 98410 77889',
    assignedClasses: ['cls_cse_b'],
    subjectsTaught: ['CS602: Compiler Design', 'CS605: Mini Project']
  },
  {
    id: 'usr_teacher_03',
    employeeCode: 'FAC-AI-008',
    name: 'Dr. Meenakshi Sundaram',
    email: 'meenakshi.s@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Artificial Intelligence',
    designation: 'Assistant Professor (Senior Grade)',
    phone: '+91 97908 44556',
    assignedClasses: ['cls_aids_a'],
    subjectsTaught: ['AI401: Deep Learning Architectures', 'AI403: NLP Lab']
  },
  {
    id: 'usr_teacher_04',
    employeeCode: 'FAC-EC-031',
    name: 'Prof. Vikramaditya Reddy',
    email: 'vikram.reddy@edunexus.edu',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    department: 'Electronics & Communication',
    designation: 'Associate Professor',
    phone: '+91 99403 66112',
    assignedClasses: ['cls_ece_a'],
    subjectsTaught: ['EC601: Digital Signal Processing', 'EC604: Embedded Systems Lab']
  }
];

export const INITIAL_ANOMALIES: Anomaly[] = [
  {
    id: 'anom_01',
    studentId: 'std_01',
    studentName: 'Aarav Kumar',
    rollNumber: '21CS101',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    type: 'session_skip',
    riskLevel: 'medium',
    confidenceScore: 94,
    title: 'Recurrent Afternoon Lab Session Drop',
    description: 'Student consistently logs 96% Forenoon attendance but drops to 79% during Afternoon lab sessions (1:30 PM - 4:30 PM) across consecutive Tuesdays & Thursdays.',
    detectedAt: 'Today at 02:15 PM',
    evidence: 'Present in FN Distributed Systems lecture (09:30 AM); Absent in AN Cloud Computing Lab (01:45 PM). Observed 4 times in last 3 weeks.',
    status: 'pending_review',
    aiSuggestedAction: 'Flag for Parent Guardian SMS & require faculty mentor counseling before lab credits sign-off.'
  },
  {
    id: 'anom_02',
    studentId: 'std_03',
    studentName: 'Rohan Deshmukh',
    rollNumber: '21CS103',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    type: 'consecutive_streak',
    riskLevel: 'high',
    confidenceScore: 98,
    title: 'Critical 4-Day Consecutive Full Absence (Sub-70% Barrier)',
    description: 'Cumulative attendance dropped to 68.25%, falling dangerously below university mandatory detention threshold (75%). Consecutive absences since Wednesday.',
    detectedAt: 'Yesterday at 04:45 PM',
    evidence: 'Absent for 8 consecutive FN & AN periods (Sep 24 – Sep 28). Medical certificate submitted pending HOD verification.',
    status: 'pending_review',
    aiSuggestedAction: 'Issue Principal Warning Letter #1 and schedule parent counseling session with Dean of Academics.'
  },
  {
    id: 'anom_03',
    studentId: 'std_05',
    studentName: 'Vikram Aditya',
    rollNumber: '21CS105',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    type: 'friday_pattern',
    riskLevel: 'high',
    confidenceScore: 91,
    title: 'Friday Afternoon Departure Pattern',
    description: 'Marked absent in AN session on 4 consecutive Fridays while present in morning theory hours, indicating deliberate early weekend transit departure.',
    detectedAt: '2 days ago',
    evidence: 'Friday FN: 100% Present. Friday AN: 0% Present (Aug 29, Sep 05, Sep 12, Sep 19).',
    status: 'pending_review',
    aiSuggestedAction: 'Mandate biometric hostel outpass validation linked to ERP attendance status.'
  },
  {
    id: 'anom_04',
    studentId: 'std_01',
    studentName: 'Aarav Kumar',
    rollNumber: '21CS101',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    type: 'sudden_drop',
    riskLevel: 'medium',
    confidenceScore: 86,
    title: 'Bi-Weekly Velocity Deceleration (-14.2%)',
    description: 'Attendance trajectory decreased from 94% down to 79.8% within a 14-day rolling window.',
    detectedAt: '3 days ago',
    evidence: 'Moving average 14-day trend slope: -1.02% per academic working day.',
    status: 'reviewed',
    reviewedBy: 'Dr. Ramesh Sundaram',
    reviewNotes: 'Noted. Advised Class Incharge Prof. Anitha to follow up during tutorial hours.'
  }
];

export const INITIAL_REQUESTS: ModificationRequest[] = [
  {
    id: 'req_01',
    requestType: 'attendance_correction',
    teacherId: 'usr_teacher_01',
    teacherName: 'Prof. Anitha Vasudevan',
    studentId: 'std_01',
    studentName: 'Aarav Kumar',
    rollNumber: '21CS101',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    dateOrExam: '2026-09-26 (AN Session)',
    subjectCode: 'CS604: Cloud Computing Lab',
    originalValue: 'Absent',
    proposedValue: 'Present (On Duty - Smart India Hackathon)',
    reason: 'Student represented our institution at the Regional Smart India Hackathon internal scrutiny round with HOD prior approval letter attached.',
    aiSafetyAssessment: {
      safetyScore: 92,
      riskIndex: 'safe',
      rationale: 'Legitimate academic OD request. Student has no disciplinary flags and HOD endorsement matches institutional event calendar.',
      historicCorrelation: 'Class incharge has 98% validated OD submission record.'
    },
    status: 'pending',
    requestedAt: '2026-09-27 10:15 AM'
  },
  {
    id: 'req_02',
    requestType: 'marks_revision',
    teacherId: 'usr_teacher_01',
    teacherName: 'Prof. Anitha Vasudevan',
    studentId: 'std_04',
    studentName: 'Sneha Venkatesan',
    rollNumber: '21CS104',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    dateOrExam: 'Mid-Term 1',
    subjectCode: 'CS601: Distributed Systems',
    originalValue: '38 / 50',
    proposedValue: '44 / 50',
    reason: 'Clerical tabulation oversight in Question 4(b) (Vector Clocks proof). Re-evaluation confirmed full 6 marks were awarded on script but omitted in master spreadsheet.',
    aiSafetyAssessment: {
      safetyScore: 89,
      riskIndex: 'safe',
      rationale: 'Score revision within reasonable bounds (+6 marks) with physical answer sheet scan audit verified.',
      historicCorrelation: 'Matches average high performance of student in previous mid-terms (45/50 in DS).'
    },
    status: 'pending',
    requestedAt: '2026-09-27 11:40 AM'
  },
  {
    id: 'req_03',
    requestType: 'attendance_correction',
    teacherId: 'usr_teacher_02',
    teacherName: 'Dr. K. S. Ramanathan',
    studentId: 'std_03',
    studentName: 'Rohan Deshmukh',
    rollNumber: '21CS103',
    classId: 'cls_cse_a',
    className: 'B.Tech CSE - 6A',
    dateOrExam: '2026-09-22 (Full Day FN & AN)',
    subjectCode: 'CS602: Compiler Design',
    originalValue: 'Absent',
    proposedValue: 'Excused Medical Leave',
    reason: 'Medical discharge summary from Apollo Hospital submitted for severe gastroenteritis.',
    aiSafetyAssessment: {
      safetyScore: 78,
      riskIndex: 'caution',
      rationale: 'Student is near 68% attendance detention margin. Retrospective medical excusals require Dean approval and CMO verification.',
      historicCorrelation: 'Repeated late medical submissions over 3 semesters.'
    },
    status: 'approved',
    requestedAt: '2026-09-25 09:30 AM',
    reviewedAt: '2026-09-25 03:00 PM',
    reviewedBy: 'Dr. Ramesh Sundaram',
    reviewRemarks: 'Approved with condition to attend 12 hours remedial Saturday clinic.'
  }
];

export const INITIAL_STUDENT_MARKS: Record<string, StudentMarkReport> = {
  std_01: {
    studentId: 'std_01',
    studentName: 'Aarav Kumar',
    rollNumber: '21CS101',
    semester: 6,
    examTerm: 'Mid-Term 1',
    totalCredits: 22,
    gpa: 8.64,
    locked: true,
    subjects: [
      {
        subjectCode: 'CS601',
        subjectName: 'Distributed Systems',
        credits: 4,
        internalMax: 50,
        internalObtained: 42,
        externalMax: 100,
        externalObtained: 84,
        totalMax: 100,
        totalObtained: 84,
        grade: 'A+',
        status: 'passed'
      },
      {
        subjectCode: 'CS602',
        subjectName: 'Compiler Design',
        credits: 4,
        internalMax: 50,
        internalObtained: 40,
        externalMax: 100,
        externalObtained: 80,
        totalMax: 100,
        totalObtained: 80,
        grade: 'A',
        status: 'passed'
      },
      {
        subjectCode: 'CS603',
        subjectName: 'Machine Learning & Applications',
        credits: 4,
        internalMax: 50,
        internalObtained: 46,
        externalMax: 100,
        externalObtained: 92,
        totalMax: 100,
        totalObtained: 92,
        grade: 'O (Outstanding)',
        status: 'passed'
      },
      {
        subjectCode: 'CS604',
        subjectName: 'Cloud Computing Laboratory',
        credits: 2,
        internalMax: 50,
        internalObtained: 36, // Lower due to missed AN sessions
        externalMax: 100,
        externalObtained: 72,
        totalMax: 100,
        totalObtained: 72,
        grade: 'B+',
        status: 'passed'
      },
      {
        subjectCode: 'CS605',
        subjectName: 'Design Thinking & Innovation',
        credits: 2,
        internalMax: 50,
        internalObtained: 45,
        externalMax: 100,
        externalObtained: 90,
        totalMax: 100,
        totalObtained: 90,
        grade: 'O',
        status: 'passed'
      }
    ]
  },
  std_02: {
    studentId: 'std_02',
    studentName: 'Pooja Narayanan',
    rollNumber: '21CS102',
    semester: 6,
    examTerm: 'Mid-Term 1',
    totalCredits: 22,
    gpa: 9.42,
    locked: true,
    subjects: [
      {
        subjectCode: 'CS601',
        subjectName: 'Distributed Systems',
        credits: 4,
        internalMax: 50,
        internalObtained: 48,
        externalMax: 100,
        externalObtained: 95,
        totalMax: 100,
        totalObtained: 95,
        grade: 'O',
        status: 'passed'
      },
      {
        subjectCode: 'CS602',
        subjectName: 'Compiler Design',
        credits: 4,
        internalMax: 50,
        internalObtained: 46,
        externalMax: 100,
        externalObtained: 92,
        totalMax: 100,
        totalObtained: 92,
        grade: 'O',
        status: 'passed'
      },
      {
        subjectCode: 'CS603',
        subjectName: 'Machine Learning',
        credits: 4,
        internalMax: 50,
        internalObtained: 47,
        externalMax: 100,
        externalObtained: 94,
        totalMax: 100,
        totalObtained: 94,
        grade: 'O',
        status: 'passed'
      }
    ]
  },
  std_03: {
    studentId: 'std_03',
    studentName: 'Rohan Deshmukh',
    rollNumber: '21CS103',
    semester: 6,
    examTerm: 'Mid-Term 1',
    totalCredits: 22,
    gpa: 6.45,
    locked: true,
    subjects: [
      {
        subjectCode: 'CS601',
        subjectName: 'Distributed Systems',
        credits: 4,
        internalMax: 50,
        internalObtained: 28,
        externalMax: 100,
        externalObtained: 56,
        totalMax: 100,
        totalObtained: 56,
        grade: 'C',
        status: 'passed'
      },
      {
        subjectCode: 'CS602',
        subjectName: 'Compiler Design',
        credits: 4,
        internalMax: 50,
        internalObtained: 24,
        externalMax: 100,
        externalObtained: 48,
        totalMax: 100,
        totalObtained: 48,
        grade: 'D',
        status: 'passed'
      }
    ]
  }
};

export const CAMPUS_BLOCKS: CampusBlockHeatmap[] = [
  {
    id: 'blk_aryabhata',
    name: 'Aryabhata Computing Complex',
    code: 'BLOCK-A',
    fnAttendanceRate: 94.2,
    anAttendanceRate: 83.4,
    occupancyRate: 89.0,
    totalStudents: 420,
    departments: ['Computer Science', 'Information Technology'],
    anomaliesDetected: 5,
    position: [-2.5, 0.8, 0],
    dimensions: [2.2, 1.6, 2.2],
    colorHex: '#3b82f6' // Indigo blue
  },
  {
    id: 'blk_ramanujan',
    name: 'Ramanujan Mathematical Science',
    code: 'BLOCK-B',
    fnAttendanceRate: 96.5,
    anAttendanceRate: 93.8,
    occupancyRate: 95.0,
    totalStudents: 380,
    departments: ['AI & Data Science', 'Mathematics'],
    anomaliesDetected: 1,
    position: [0.8, 1.2, -1.8],
    dimensions: [2.4, 2.4, 1.8],
    colorHex: '#10b981' // Emerald green
  },
  {
    id: 'blk_raman',
    name: 'Sir C.V. Raman Physics & Tech',
    code: 'BLOCK-C',
    fnAttendanceRate: 88.4,
    anAttendanceRate: 77.1,
    occupancyRate: 82.5,
    totalStudents: 360,
    departments: ['Electronics & Comm', 'Electrical & Instrumentation'],
    anomaliesDetected: 7,
    position: [2.8, 0.9, 0.6],
    dimensions: [2.0, 1.8, 2.0],
    colorHex: '#f59e0b' // Amber/Warning
  },
  {
    id: 'blk_visvesvaraya',
    name: 'Sir M. Visvesvaraya Mech Wing',
    code: 'BLOCK-D',
    fnAttendanceRate: 82.1,
    anAttendanceRate: 71.5,
    occupancyRate: 76.8,
    totalStudents: 310,
    departments: ['Mechanical Engineering', 'Civil & Robotics'],
    anomaliesDetected: 9,
    position: [-0.6, 0.7, 2.4],
    dimensions: [2.6, 1.4, 1.9],
    colorHex: '#ef4444' // Coral red
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    targetRole: 'principal',
    title: 'Urgent: Faculty Modification Approval Required',
    message: 'Prof. Anitha Vasudevan submitted attendance On-Duty amendment for Aarav Kumar (21CS101). AI Safety Index: 92% (Safe).',
    type: 'warning',
    timestamp: '15 mins ago',
    read: false,
    linkAction: 'requests'
  },
  {
    id: 'notif_02',
    targetRole: 'all',
    title: 'Dual-Session Roll-Call Lock Notice',
    message: 'FN session attendance freeze at 12:45 PM. AN laboratory registers unlock at 01:30 PM.',
    type: 'info',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 'notif_03',
    targetRole: 'parent',
    targetUserId: 'usr_parent_01',
    title: 'Afternoon Departure Notification',
    message: 'Aarav Kumar (21CS101) was marked Absent for Afternoon Lab Session (01:30 PM - 04:30 PM) on Sep 26.',
    type: 'alert',
    timestamp: '2 days ago',
    read: false,
    linkAction: 'attendance'
  }
];

export const GENERATE_INITIAL_ATTENDANCE = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const dates = ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28'];

  INITIAL_STUDENTS.forEach((student) => {
    dates.forEach((date) => {
      // Forenoon session
      let fnStatus: 'present' | 'absent' | 'late' = 'present';
      if (student.id === 'std_03') fnStatus = 'absent';
      records.push({
        id: `att_${student.id}_${date}_FN`,
        studentId: student.id,
        date,
        session: 'FN',
        status: fnStatus,
        markedBy: 'usr_teacher_01',
        markedAt: `${date} 09:15:00`
      });

      // Afternoon session
      let anStatus: 'present' | 'absent' | 'late' = 'present';
      if (student.id === 'std_01' && (date === '2026-09-26' || date === '2026-09-28')) {
        anStatus = 'absent'; // Session skipping
      } else if (student.id === 'std_03') {
        anStatus = 'absent';
      } else if (student.id === 'std_05' && (date === '2026-09-26')) {
        anStatus = 'absent';
      }

      records.push({
        id: `att_${student.id}_${date}_AN`,
        studentId: student.id,
        date,
        session: 'AN',
        status: anStatus,
        markedBy: 'usr_teacher_01',
        markedAt: `${date} 13:45:00`
      });
    });
  });

  return records;
};
