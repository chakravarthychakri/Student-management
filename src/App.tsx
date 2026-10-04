import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import EduTrackLogo from "@/components/EduTrackLogo"

// Contexts & Protection
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

// Layouts
import AuthLayout from "./layouts/AuthLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import EduNexusLayout from "./layouts/EduNexusLayout"

// Auth Pages
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import ForgotPassword from "./pages/auth/ForgotPassword"

// Student Pages
import StudentDashboard from "./pages/student/Dashboard"
import StudentAssignments from "./pages/student/Assignments"
import StudentAssignmentDetails from "./pages/student/AssignmentDetails"
import StudentGrades from "./pages/student/Grades"
import StudentCredits from "./pages/student/Credits"
import StudentProfile from "./pages/student/Profile"
import StudentAnalytics from "./pages/student/Analytics"

// Professor Pages
import ProfessorDashboard from "./pages/professor/Dashboard"
import ProfessorClasses from "./pages/professor/Classes"
import ProfessorSubjects from "./pages/professor/Subjects"
import ProfessorSubjectDetail from "./pages/professor/SubjectDetail"
import ProfessorAssignments from "./pages/professor/Assignments"
import ProfessorCreateAssignment from "./pages/professor/CreateAssignment"
import ProfessorAssignmentSubmissions from "./pages/professor/AssignmentSubmissions"
import ProfessorAllSubmissions from "./pages/professor/AllSubmissions"
import ProfessorReviewSubmission from "./pages/professor/ReviewSubmission"
import SimilarityReport from "./pages/professor/SimilarityReport"
import PlagiarismMonitor from "./pages/professor/PlagiarismMonitor"
import ProfessorProfile from "./pages/professor/Profile"
import ProfessorAnalytics from "./pages/professor/Analytics"

// EduNexus (Student Learning Hub) Pages
import LearningHomeRouter from "./pages/learning/LearningHomeRouter"
import NotesExplorer from "./pages/learning/NotesExplorer"
import NoteReader from "./pages/learning/NoteReader"
import MultimediaResources from "./pages/learning/MultimediaResources"
import VivaExplorer from "./pages/learning/VivaExplorer"
import VivaQuizTake from "./pages/learning/VivaQuizTake"
import VivaResult from "./pages/learning/VivaResult"
import StudentProgress from "./pages/learning/StudentProgress"
import Bookmarks from "./pages/learning/Bookmarks"
import GlobalSearch from "./pages/learning/GlobalSearch"
import SubjectDetail from "./pages/learning/SubjectDetail"

// Faculty EduNexus Pages
import FacultyDashboard from "./pages/learning/faculty/FacultyDashboard"
import FacultyNotesList from "./pages/learning/faculty/FacultyNotesList"
import CreateEditNote from "./pages/learning/faculty/CreateEditNote"
import FacultyVivaList from "./pages/learning/faculty/FacultyVivaList"
import CreateEditViva from "./pages/learning/faculty/CreateEditViva"
import QuestionBank from "./pages/learning/faculty/QuestionBank"
import FacultyAnalytics from "./pages/learning/faculty/FacultyAnalytics"

import ErrorBoundary from "./components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Default route redirects to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Authentication Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* EduTrack: Student Routes */}
            <Route element={<ProtectedRoute allowedRole="student" />}>
              <Route element={<DashboardLayout type="student" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/assignments" element={<StudentAssignments />} />
                <Route path="/student/assignments/:id" element={<StudentAssignmentDetails />} />
                <Route path="/student/grades" element={<StudentGrades />} />
                <Route path="/student/credits" element={<StudentCredits />} />
                <Route path="/student/analytics" element={<StudentAnalytics />} />
                <Route path="/student/profile" element={<StudentProfile />} />
              </Route>
            </Route>

            {/* EduTrack: Professor Routes */}
            <Route element={<ProtectedRoute allowedRole="professor" />}>
              <Route element={<DashboardLayout type="professor" />}>
                <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
                <Route path="/professor/classes" element={<ProfessorClasses />} />
                <Route path="/professor/subjects" element={<ProfessorSubjects />} />
                <Route path="/professor/subjects/:subjectId" element={<ProfessorSubjectDetail />} />
                <Route path="/professor/subjects/:subjectId/assignments/create" element={<ProfessorCreateAssignment />} />
                <Route path="/professor/assignments" element={<ProfessorAssignments />} />
                <Route path="/professor/assignments/create" element={<ProfessorCreateAssignment />} />
                <Route path="/professor/assignments/:id/submissions" element={<ProfessorAssignmentSubmissions />} />
                <Route path="/professor/submissions" element={<ProfessorAllSubmissions />} />
                <Route path="/professor/submissions/:id/review" element={<ProfessorReviewSubmission />} />
                <Route path="/professor/submissions/:id/similarity" element={<SimilarityReport />} />
                <Route path="/professor/plagiarism" element={<PlagiarismMonitor />} />
                <Route path="/professor/analytics" element={<ProfessorAnalytics />} />
                <Route path="/professor/profile" element={<ProfessorProfile />} />
              </Route>
            </Route>

            {/* EduNexus: Integrated Learning Hub Routes (Single Sign-On for both Student & Faculty) */}
            <Route element={<ProtectedRoute allowedRole="any" />}>
              <Route element={<EduNexusLayout />}>
                {/* Core Learning Hub Routes */}
                <Route path="/learning" element={<LearningHomeRouter />} />
                <Route path="/learning/notes" element={<NotesExplorer />} />
                <Route path="/learning/notes/:id" element={<NoteReader />} />
                <Route path="/learning/resources" element={<MultimediaResources />} />
                <Route path="/learning/viva" element={<VivaExplorer />} />
                <Route path="/learning/viva/:id" element={<VivaQuizTake />} />
                <Route path="/learning/viva/:id/result" element={<VivaResult />} />
                <Route path="/learning/progress" element={<StudentProgress />} />
                <Route path="/learning/bookmarks" element={<Bookmarks />} />
                <Route path="/learning/search" element={<GlobalSearch />} />
                <Route path="/learning/subjects/:id" element={<SubjectDetail />} />

                {/* Faculty Specific Learning Routes */}
                <Route path="/learning/faculty/dashboard" element={<FacultyDashboard />} />
                <Route path="/learning/faculty/notes" element={<FacultyNotesList />} />
                <Route path="/learning/faculty/notes/new" element={<CreateEditNote />} />
                <Route path="/learning/faculty/notes/edit/:id" element={<CreateEditNote />} />
                <Route path="/learning/faculty/viva" element={<FacultyVivaList />} />
                <Route path="/learning/faculty/viva/new" element={<CreateEditViva />} />
                <Route path="/learning/faculty/viva/edit/:id" element={<CreateEditViva />} />
                <Route path="/learning/faculty/questions" element={<QuestionBank />} />
                <Route path="/learning/faculty/analytics" element={<FacultyAnalytics />} />
              </Route>
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={
              <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-4 bg-[#F4F7FE]">
                <EduTrackLogo size="xl" />
                <h1 className="text-3xl font-extrabold text-[#0B1E43] mt-2">404 - Page Not Found</h1>
                <p className="text-muted-foreground max-w-sm">The page you are looking for does not exist or has been moved.</p>
                <Button asChild className="rounded-full px-8 font-bold bg-[#1E5EFF] mt-2">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            } />
          </Routes>
        </AuthProvider>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
