import bcrypt from "bcryptjs";
import {
  User,
  Student,
  Teacher,
  Parent,
  Class,
  Subject,
  Attendance,
  AttendanceCorrectionRequest,
  Exam,
  Mark,
  Notification,
  AnomalyRecord,
  AuditLog,
  AttendanceSession,
  AttendanceStatus,
} from "../types";

export interface CampusBlock {
  id: string;
  name: string;
  code: string;
  fnAttendanceRate: number;
  anAttendanceRate: number;
  occupancyRate: number;
  totalStudents: number;
  departments: string[];
  anomaliesDetected: number;
  position: [number, number, number];
  dimensions: [number, number, number];
  colorHex: string;
}

export interface StudentMarkReport {
  studentId: string;
  studentName: string;
  rollNumber: string;
  semester: number;
  examTerm: "Mid-Term 1" | "Mid-Term 2" | "Semester End";
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    credits: number;
    internalMax: number;
    internalObtained: number;
    externalMax: number;
    externalObtained: number;
    totalMax: number;
    totalObtained: number;
    grade: string;
    status: "passed" | "failed" | "withheld";
  }>;
  totalCredits: number;
  gpa: number;
  locked: boolean;
}

class InMemoryERPDatabase {
  users: User[] = [];
  teachers: (Teacher & { email?: string; avatar?: string; assignedClasses?: string[]; subjectsTaught?: string[] })[] = [];
  parents: (Parent & { email?: string; avatar?: string; studentId?: string; studentName?: string })[] = [];
  students: any[] = [];
  classes: any[] = [];
  subjects: Subject[] = [];
  attendance: any[] = [];
  requests: any[] = [];
  anomalies: any[] = [];
  notifications: any[] = [];
  marks: Record<string, StudentMarkReport> = {};
  auditLogs: any[] = [];
  campusBlocks: CampusBlock[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // Generate bcrypt hashes
    const salt = bcrypt.genSaltSync(10);
    const principalHash = bcrypt.hashSync("nexus@2026", salt);
    const teacherHash = bcrypt.hashSync("teacher@2026", salt);
    const parentHash = bcrypt.hashSync("parent@2026", salt);

    // 1. Users
    this.users = [
      {
        id: "usr_principal_01",
        email: "principal@edunexus.edu",
        password_hash: principalHash,
        role: "PRINCIPAL",
        name: "Dr. Ramesh Sundaram",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "usr_teacher_01",
        email: "anitha.v@edunexus.edu",
        password_hash: teacherHash,
        role: "TEACHER",
        name: "Prof. Anitha Vasudevan",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "usr_parent_01",
        email: "suresh.kumar@gmail.com",
        password_hash: parentHash,
        role: "PARENT",
        name: "Suresh Kumar",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 2. Teachers
    this.teachers = [
      {
        id: "usr_teacher_01",
        user_id: "usr_teacher_01",
        name: "Prof. Anitha Vasudevan",
        employee_id: "FAC-CS-042",
        department: "Computer Science & Engineering",
        phone: "+91 98402 33445",
        qualification: "Ph.D in Distributed Systems, M.Tech CSE",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "anitha.v@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        assignedClasses: ["cls_cse_a"],
        subjectsTaught: ["CS8401 Operating Systems", "CS8402 DBMS"],
      },
      {
        id: "usr_teacher_02",
        user_id: "usr_teacher_02",
        name: "Dr. K. S. Ramanathan",
        employee_id: "FAC-CS-018",
        department: "Computer Science & Engineering",
        phone: "+91 94441 55667",
        qualification: "Ph.D in AI/ML",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "ramanathan.ks@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        assignedClasses: ["cls_cse_b"],
        subjectsTaught: ["CS8403 Machine Learning"],
      },
      {
        id: "usr_teacher_03",
        user_id: "usr_teacher_03",
        name: "Dr. Meenakshi Sundaram",
        employee_id: "FAC-AI-005",
        department: "Artificial Intelligence & Data Science",
        phone: "+91 98409 77889",
        qualification: "Ph.D in Data Science",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "meenakshi.s@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        assignedClasses: ["cls_aids_a"],
        subjectsTaught: ["AI8201 Deep Learning"],
      },
    ];

    // 3. Parents
    this.parents = [
      {
        id: "usr_parent_01",
        user_id: "usr_parent_01",
        name: "Suresh Kumar",
        phone: "+91 98840 55667",
        occupation: "Senior Principal Architect at Infosys",
        address: "Plot 42, Anna Nagar West Extension, Chennai",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "suresh.kumar@gmail.com",
        studentId: "std_01",
        studentName: "Aarav Kumar",
      },
    ];

    // 4. Classes
    this.classes = [
      {
        id: "cls_cse_a",
        code: "CSE-3A",
        name: "B.Tech CSE - Semester 6 (Section A)",
        department: "Computer Science & Engineering",
        semester: 6,
        section: "A",
        classTeacherId: "usr_teacher_01",
        classTeacherName: "Prof. Anitha Vasudevan",
        totalStudents: 38,
        todaysFnRate: 94.7,
        todaysAnRate: 81.6,
        overallRate: 88.2,
        roomNumber: "LH-302",
        block: "Aryabhata Computing Centre",
      },
      {
        id: "cls_cse_b",
        code: "CSE-3B",
        name: "B.Tech CSE - Semester 6 (Section B)",
        department: "Computer Science & Engineering",
        semester: 6,
        section: "B",
        classTeacherId: "usr_teacher_02",
        classTeacherName: "Dr. K. S. Ramanathan",
        totalStudents: 40,
        todaysFnRate: 92.5,
        todaysAnRate: 85.0,
        overallRate: 87.5,
        roomNumber: "LH-304",
        block: "Aryabhata Computing Centre",
      },
      {
        id: "cls_aids_a",
        code: "AIDS-2A",
        name: "B.Tech AI & Data Science - Sem 4 (A)",
        department: "Artificial Intelligence & Data Science",
        semester: 4,
        section: "A",
        classTeacherId: "usr_teacher_03",
        classTeacherName: "Dr. Meenakshi Sundaram",
        totalStudents: 36,
        todaysFnRate: 97.2,
        todaysAnRate: 94.4,
        overallRate: 93.8,
        roomNumber: "LH-401",
        block: "Ramanujan Mathematical Science",
      },
      {
        id: "cls_ece_a",
        code: "ECE-3A",
        name: "B.Tech ECE - Semester 6 (Section A)",
        department: "Electronics & Communication",
        semester: 6,
        section: "A",
        classTeacherId: "usr_teacher_04",
        classTeacherName: "Prof. Vikramaditya Reddy",
        totalStudents: 34,
        todaysFnRate: 88.2,
        todaysAnRate: 76.5,
        overallRate: 82.4,
        roomNumber: "VLSI-201",
        block: "Sir C.V. Raman Physics & Tech",
      },
    ];

    // 5. Students
    this.students = [
      {
        id: "std_01",
        rollNumber: "21CS101",
        name: "Aarav Kumar",
        email: "aarav.21cs@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        section: "A",
        department: "Computer Science",
        semester: 6,
        parentName: "Suresh Kumar",
        parentPhone: "+91 98840 55667",
        parentEmail: "suresh.kumar@gmail.com",
        fnAttendanceRate: 95.8,
        anAttendanceRate: 79.2,
        overallAttendanceRate: 87.5,
        academicCgpa: 8.64,
        riskLevel: "medium",
        tags: ["Hosteller", "Placement Eligible", "FN-AN Disparity"],
      },
      {
        id: "std_02",
        rollNumber: "21CS102",
        name: "Pooja Narayanan",
        email: "pooja.21cs@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        section: "A",
        department: "Computer Science",
        semester: 6,
        parentName: "Narayanan R",
        parentPhone: "+91 98401 22334",
        parentEmail: "narayanan.r@yahoo.com",
        fnAttendanceRate: 98.2,
        anAttendanceRate: 97.4,
        overallAttendanceRate: 97.8,
        academicCgpa: 9.42,
        riskLevel: "low",
        tags: ["Department Rank 1", "IEEE Student Chair"],
      },
      {
        id: "std_03",
        rollNumber: "21CS103",
        name: "Rohan Deshmukh",
        email: "rohan.21cs@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        section: "A",
        department: "Computer Science",
        semester: 6,
        parentName: "Sunil Deshmukh",
        parentPhone: "+91 94451 88990",
        parentEmail: "sunil.deshmukh@gmail.com",
        fnAttendanceRate: 74.0,
        anAttendanceRate: 62.5,
        overallAttendanceRate: 68.25,
        academicCgpa: 6.45,
        riskLevel: "high",
        tags: ["Critical Attendance (<75%)", "Medical Leave Submitted"],
      },
      {
        id: "std_04",
        rollNumber: "21CS104",
        name: "Sneha Venkatesan",
        email: "sneha.21cs@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        section: "A",
        department: "Computer Science",
        semester: 6,
        parentName: "Venkatesan K",
        parentPhone: "+91 98841 99221",
        parentEmail: "venkat.k@gmail.com",
        fnAttendanceRate: 92.5,
        anAttendanceRate: 91.0,
        overallAttendanceRate: 91.75,
        academicCgpa: 8.95,
        riskLevel: "low",
        tags: ["Sports Quota - Badminton", "Merit Scholar"],
      },
      {
        id: "std_05",
        rollNumber: "21CS105",
        name: "Vikram Aditya",
        email: "vikram.21cs@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        section: "A",
        department: "Computer Science",
        semester: 6,
        parentName: "Chandrasekhar A",
        parentPhone: "+91 94440 66778",
        parentEmail: "chandra.a@gmail.com",
        fnAttendanceRate: 85.0,
        anAttendanceRate: 68.0,
        overallAttendanceRate: 76.5,
        academicCgpa: 7.2,
        riskLevel: "high",
        tags: ["Session Skipping Pattern", "Lab Absentee"],
      },
      {
        id: "std_06",
        rollNumber: "21CS106",
        name: "Ananya Raghavan",
        email: "ananya.21cs@edunexus.edu",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        section: "A",
        department: "Computer Science",
        semester: 6,
        parentName: "Raghavan S",
        parentPhone: "+91 98409 33221",
        parentEmail: "raghavan.s@gmail.com",
        fnAttendanceRate: 96.0,
        anAttendanceRate: 95.0,
        overallAttendanceRate: 95.5,
        academicCgpa: 9.12,
        riskLevel: "low",
        tags: ["Coding Club Lead"],
      },
    ];

    // 6. Attendance records (FN & AN)
    const dates = ["2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28"];
    this.students.forEach((student) => {
      dates.forEach((date) => {
        let fnStatus = "present";
        if (student.id === "std_03") fnStatus = "absent";
        this.attendance.push({
          id: `att_${student.id}_${date}_FN`,
          studentId: student.id,
          date,
          session: "FN",
          status: fnStatus,
          markedBy: "usr_teacher_01",
          markedAt: `${date} 09:15:00`,
        });

        let anStatus = "present";
        if (student.id === "std_01" && (date === "2026-09-26" || date === "2026-09-28")) {
          anStatus = "absent";
        } else if (student.id === "std_03") {
          anStatus = "absent";
        } else if (student.id === "std_05" && date === "2026-09-26") {
          anStatus = "absent";
        }

        this.attendance.push({
          id: `att_${student.id}_${date}_AN`,
          studentId: student.id,
          date,
          session: "AN",
          status: anStatus,
          markedBy: "usr_teacher_01",
          markedAt: `${date} 13:45:00`,
        });
      });
    });

    // 7. Modification Requests
    this.requests = [
      {
        id: "req_01",
        requestType: "attendance_correction",
        teacherId: "usr_teacher_01",
        teacherName: "Prof. Anitha Vasudevan",
        studentId: "std_01",
        studentName: "Aarav Kumar",
        rollNumber: "21CS101",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        dateOrExam: "2026-09-26 (AN Session)",
        originalValue: "Absent",
        proposedValue: "Present (On-Duty)",
        reason: "Represented college at Smart India Hackathon internal scrutiny round with prior permission from Dean of Student Affairs.",
        aiSafetyAssessment: {
          safetyScore: 94,
          riskIndex: "safe",
          rationale: "Official institutional event participation verified against college sports/hackathon schedule with active faculty endorsement.",
          historicCorrelation: "Class incharge has established 96.4% historical audit validity rate across 45 past submission requests.",
        },
        status: "pending",
        requestedAt: "Sep 27, 2026, 11:30 AM",
      },
      {
        id: "req_02",
        requestType: "marks_revision",
        teacherId: "usr_teacher_01",
        teacherName: "Prof. Anitha Vasudevan",
        studentId: "std_04",
        studentName: "Sneha Venkatesan",
        rollNumber: "21CS104",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        dateOrExam: "Mid-Term 1: Operating Systems",
        subjectCode: "CS8401",
        originalValue: "42 / 50",
        proposedValue: "47 / 50",
        reason: "Clerical data entry discrepancy discovered during student paper inspection. Question 4(b) (5 marks) was evaluated but accidentally omitted in the digital gradebook tally.",
        aiSafetyAssessment: {
          safetyScore: 88,
          riskIndex: "safe",
          rationale: "Legitimate arithmetic correction bounded within standard clerical margin (+5 marks). Verified against original physical rubric scan.",
          historicCorrelation: "Low variance profile. Student possesses 8.95 CGPA, making the revision statistically consistent with past performance.",
        },
        status: "pending",
        requestedAt: "Sep 26, 2026, 04:15 PM",
      },
    ];

    // 8. Anomalies
    this.anomalies = [
      {
        id: "anom_01",
        studentId: "std_01",
        studentName: "Aarav Kumar",
        rollNumber: "21CS101",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        type: "session_skip",
        riskLevel: "medium",
        confidenceScore: 94,
        title: "Systematic Afternoon Laboratory Departures",
        description: "Aarav has maintained a 95.8% Forenoon lecture presence, but records only 79.2% during Afternoon hands-on laboratory sessions. Multiple instances of attending morning theory and skipping post-lunch lab.",
        detectedAt: "Sep 27, 2026, 04:45 PM",
        evidence: "Sep 26: FN Present, AN Absent | Sep 24: FN Present, AN Absent. Pattern matches post-lunch hostel departure signature.",
        status: "pending_review",
        aiSuggestedAction: "Notify Guardian via automated SMS digest and schedule class tutor counseling.",
      },
      {
        id: "anom_02",
        studentId: "std_03",
        studentName: "Rohan Deshmukh",
        rollNumber: "21CS103",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        type: "sudden_drop",
        riskLevel: "high",
        confidenceScore: 98,
        title: "Acute Longitudinal Attendance Deterioration",
        description: "Student overall attendance declined by 26.4% over the last 14 academic working days. Current cumulative rate (68.2%) is below institutional exam hall ticket eligibility cutoff (75%).",
        detectedAt: "Sep 25, 2026, 09:30 AM",
        evidence: "Rolling 14-day average: 58.3% vs historic baseline 84.7%. Medical leave cited but incomplete documentation registered.",
        status: "pending_review",
        aiSuggestedAction: "Escalate to Principal for parent summoning before end-semester exam hall tickets are locked.",
      },
      {
        id: "anom_03",
        studentId: "std_05",
        studentName: "Vikram Aditya",
        rollNumber: "21CS105",
        classId: "cls_cse_a",
        className: "B.Tech CSE - 6A",
        type: "consecutive_streak",
        riskLevel: "high",
        confidenceScore: 91,
        title: "Friday Laboratory Disparity Signature",
        description: "Consistent absenteeism in Friday Afternoon Practical sessions over 3 consecutive cycles while retaining high Friday morning attendance.",
        detectedAt: "Sep 26, 2026, 05:00 PM",
        evidence: "Aug 29, Sep 05, Sep 12, Sep 26: All marked absent for Database Systems Laboratory.",
        status: "pending_review",
        aiSuggestedAction: "Issue automated alert to course instructor and require parent acknowledgment via SMS.",
      },
    ];

    // 9. Notifications
    this.notifications = [
      {
        id: "notif_01",
        targetRole: "principal",
        title: "Urgent: Faculty Modification Approval Required",
        message: "Prof. Anitha Vasudevan submitted attendance On-Duty amendment for Aarav Kumar (21CS101). AI Safety Index: 94% (Safe).",
        type: "warning",
        timestamp: "15 mins ago",
        read: false,
        linkAction: "requests",
      },
      {
        id: "notif_02",
        targetRole: "all",
        title: "Dual-Session Roll-Call Lock Notice",
        message: "FN session attendance freeze at 12:45 PM. AN laboratory registers unlock at 01:30 PM.",
        type: "info",
        timestamp: "1 hour ago",
        read: false,
      },
      {
        id: "notif_03",
        targetRole: "parent",
        targetUserId: "usr_parent_01",
        title: "Afternoon Departure Notification",
        message: "Aarav Kumar (21CS101) was marked Absent for Afternoon Lab Session (01:30 PM - 04:30 PM) on Sep 26.",
        type: "alert",
        timestamp: "2 days ago",
        read: false,
        linkAction: "attendance",
      },
    ];

    // 10. Marks
    this.marks["std_01"] = {
      studentId: "std_01",
      studentName: "Aarav Kumar",
      rollNumber: "21CS101",
      semester: 6,
      examTerm: "Mid-Term 1",
      totalCredits: 22,
      gpa: 8.64,
      locked: false,
      subjects: [
        {
          subjectCode: "CS8401",
          subjectName: "Operating Systems Principles",
          credits: 4,
          internalMax: 50,
          internalObtained: 44,
          externalMax: 100,
          externalObtained: 88,
          totalMax: 100,
          totalObtained: 88,
          grade: "A+",
          status: "passed",
        },
        {
          subjectCode: "CS8402",
          subjectName: "Database Management Systems",
          credits: 4,
          internalMax: 50,
          internalObtained: 46,
          externalMax: 100,
          externalObtained: 92,
          totalMax: 100,
          totalObtained: 92,
          grade: "O (Outstanding)",
          status: "passed",
        },
        {
          subjectCode: "CS8403",
          subjectName: "Computer Networks & Security",
          credits: 4,
          internalMax: 50,
          internalObtained: 38,
          externalMax: 100,
          externalObtained: 76,
          totalMax: 100,
          totalObtained: 76,
          grade: "A",
          status: "passed",
        },
        {
          subjectCode: "CS8404",
          subjectName: "Machine Learning Foundations",
          credits: 4,
          internalMax: 50,
          internalObtained: 42,
          externalMax: 100,
          externalObtained: 84,
          totalMax: 100,
          totalObtained: 84,
          grade: "A+",
          status: "passed",
        },
        {
          subjectCode: "CS8405",
          subjectName: "Web Technologies & Microservices",
          credits: 3,
          internalMax: 50,
          internalObtained: 48,
          externalMax: 100,
          externalObtained: 96,
          totalMax: 100,
          totalObtained: 96,
          grade: "O (Outstanding)",
          status: "passed",
        },
        {
          subjectCode: "CS8406",
          subjectName: "Cloud Computing Architectures",
          credits: 3,
          internalMax: 50,
          internalObtained: 41,
          externalMax: 100,
          externalObtained: 82,
          totalMax: 100,
          totalObtained: 82,
          grade: "A+",
          status: "passed",
        },
      ],
    };

    // 11. Campus Blocks
    this.campusBlocks = [
      {
        id: "blk_aryabhata",
        name: "Aryabhata Computing Complex",
        code: "BLOCK-A",
        fnAttendanceRate: 94.2,
        anAttendanceRate: 83.4,
        occupancyRate: 89.0,
        totalStudents: 420,
        departments: ["Computer Science", "Information Technology"],
        anomaliesDetected: 5,
        position: [-2.5, 0.8, 0],
        dimensions: [2.2, 1.6, 2.2],
        colorHex: "#3b82f6",
      },
      {
        id: "blk_ramanujan",
        name: "Ramanujan Mathematical Science",
        code: "BLOCK-B",
        fnAttendanceRate: 96.5,
        anAttendanceRate: 93.8,
        occupancyRate: 95.0,
        totalStudents: 380,
        departments: ["AI & Data Science", "Mathematics"],
        anomaliesDetected: 1,
        position: [0.8, 1.2, -1.8],
        dimensions: [2.4, 2.4, 1.8],
        colorHex: "#10b981",
      },
      {
        id: "blk_raman",
        name: "Sir C.V. Raman Physics & Tech",
        code: "BLOCK-C",
        fnAttendanceRate: 88.4,
        anAttendanceRate: 77.1,
        occupancyRate: 82.5,
        totalStudents: 360,
        departments: ["Electronics & Comm", "Electrical & Instrumentation"],
        anomaliesDetected: 7,
        position: [2.8, 0.9, 0.6],
        dimensions: [2.0, 1.8, 2.0],
        colorHex: "#f59e0b",
      },
      {
        id: "blk_visvesvaraya",
        name: "Sir M. Visvesvaraya Mech Wing",
        code: "BLOCK-D",
        fnAttendanceRate: 82.1,
        anAttendanceRate: 71.5,
        occupancyRate: 76.8,
        totalStudents: 310,
        departments: ["Mechanical Engineering", "Civil & Robotics"],
        anomaliesDetected: 9,
        position: [-0.6, 0.7, 2.4],
        dimensions: [2.6, 1.4, 1.9],
        colorHex: "#ef4444",
      },
    ];
  }
}

export const dbStore = new InMemoryERPDatabase();
