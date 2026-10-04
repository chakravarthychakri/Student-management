// @ts-nocheck
import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  FileText, 
  Eye, 
  Sparkles, 
  Plus, 
  X,
  Save,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { LearningNote } from "@/types/learning.types"

export default function CreateEditNote() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])

  // Form State
  const [formData, setFormData] = useState<Partial<LearningNote>>({
    title: "",
    description: "",
    subject_id: "",
    unit: "Unit 1",
    topic: "",
    difficulty: "Intermediate",
    estimated_minutes: 15,
    content_type: "rich_text",
    content: `# Introduction & Overview

## 1. Core Principles
Write comprehensive lecture notes here for your students...

- Key Definition 1
- Key Definition 2

## 2. Examples & Practice
\`\`\`c
// Sample code demonstration
int main() {
    printf("EduNexus Learning");
    return 0;
}
\`\`\`
`,
    tags: ["Engineering", "Core"],
    learning_objectives: ["Understand basic definitions", "Apply core concepts to problems"],
    prerequisites: ["Prerequisites for this unit"],
    status: "published"
  })

  const [tagInput, setTagInput] = useState("")
  const [objectiveInput, setObjectiveInput] = useState("")

  useEffect(() => {
    const fetchInit = async () => {
      const subs = await LearningService.getStudentSubjects(profile?.id)
      setSubjects(subs)
      if (subs.length > 0 && !formData.subject_id) {
        setFormData((prev) => ({ ...prev, subject_id: subs[0].id }))
      }

      if (id) {
        const existing = await LearningService.getNoteById(id, profile?.id)
        if (existing) {
          setFormData(existing)
        }
      }
    }
    fetchInit()
  }, [id, profile?.id])

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags?.filter((t) => t !== tag) }))
  }

  const handleAddObjective = () => {
    if (objectiveInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        learning_objectives: [...(prev.learning_objectives || []), objectiveInput.trim()]
      }))
      setObjectiveInput("")
    }
  }

  const handleRemoveObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      learning_objectives: prev.learning_objectives?.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async (status: "draft" | "published") => {
    if (!formData.title?.trim()) {
      toast.error("Please enter a note title")
      setCurrentStep(1)
      return
    }

    setLoading(true)
    try {
      if (isEditing && id) {
        await LearningService.updateNote(id, { ...formData, status })
        toast.success("Note updated successfully! 🎉")
      } else {
        await LearningService.createNote({
          ...formData,
          status,
          faculty_id: profile?.id || "fac-1"
        })
        toast.success(status === "published" ? "Note published successfully! 🎉" : "Draft saved successfully!")
      }
      navigate("/learning/faculty/notes")
    } catch (err) {
      toast.error("Failed to save note")
    } finally {
      setLoading(false)
    }
  }

  const selectedSubjectObj = subjects.find((s) => s.id === formData.subject_id) || subjects[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/learning/faculty/notes"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Notes Management</span>
        </Link>

        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
          Step {currentStep} of 4
        </span>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { step: 1, label: "Basic Info" },
          { step: 2, label: "Academic Mapping" },
          { step: 3, label: "Content Editor" },
          { step: 4, label: "Live Preview & Publish" }
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex flex-col items-center gap-1 ${
              currentStep === s.step
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : currentStep > s.step
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            <span className="text-[10px] opacity-80 uppercase">Step {s.step}</span>
            <span className="truncate max-w-[120px]">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900">
              Step 1: Basic Information
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Define the title, summary description, difficulty, and estimated reading time.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Note Title <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Linear Data Structures: Singly & Doubly Linked Lists"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Overview & Summary Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary explaining what students will learn from this study note..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Estimated Duration (Minutes)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={formData.estimated_minutes}
                  onChange={(e) => setFormData({ ...formData, estimated_minutes: Number(e.target.value) })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Content Type Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Resource / Content Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {[
                  { id: "pdf", label: "PDF", icon: "📄" },
                  { id: "document", label: "Document", icon: "📑" },
                  { id: "video", label: "Video", icon: "🎥" },
                  { id: "audio", label: "Audio", icon: "🎧" },
                  { id: "presentation", label: "Presentation", icon: "📊" },
                  { id: "link", label: "External Link", icon: "🔗" },
                  { id: "rich_text", label: "Text", icon: "📝" }
                ].map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, content_type: ct.id })}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      formData.content_type === ct.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102"
                        : "bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span className="text-base">{ct.icon}</span>
                    <span>{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              onClick={() => setCurrentStep(2)}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2"
            >
              <span>Next: Academic Mapping</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Academic Mapping */}
      {currentStep === 2 && (
        <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900">
              Step 2: Academic Mapping & Objectives
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Map this note to a specific subject, syllabus unit, topic, and outline learning objectives.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Target Subject
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Curriculum Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                >
                  <option value="Unit 1">Unit 1</option>
                  <option value="Unit 2">Unit 2</option>
                  <option value="Unit 3">Unit 3</option>
                  <option value="Unit 4">Unit 4</option>
                  <option value="Unit 5">Unit 5</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Topic Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Linked Lists & Complexity"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Learning Objectives Builder */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Key Learning Objectives
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Add a key outcome (e.g. Master Floyd's cycle detection algorithm)..."
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
                />
                <Button
                  type="button"
                  onClick={handleAddObjective}
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1.5">
                {formData.learning_objectives?.map((obj, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-950 text-xs font-semibold border border-emerald-100">
                    <span>• {obj}</span>
                    <button type="button" onClick={() => handleRemoveObjective(idx)} className="text-slate-400 hover:text-rose-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Tags & Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="e.g. Pointers, Sorting, Algorithms..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="h-10 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-2xl bg-slate-800 text-white font-bold text-xs shrink-0 px-4"
                >
                  Add Tag
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {formData.tags?.map((t, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                    {t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="rounded-2xl font-bold text-xs"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2"
            >
              <span>Next: Content Editor</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Content Editor */}
      {currentStep === 3 && (
        <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900">
              Step 3: Interactive Markdown & Content Editor
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Write formatted lesson text, code snippets, formula tables, or attach external references.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Lecture Notes Content (Markdown Supported)
              </label>
              <textarea
                rows={16}
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="rounded-2xl font-bold text-xs"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(4)}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2"
            >
              <span>Next: Student Preview</span>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Live Student Preview & Publishing */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Student View Live Preview
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                This is exactly how enrolled students will experience this study note in EduNexus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={loading}
                className="rounded-2xl border-slate-200 font-bold text-xs gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save as Draft</span>
              </Button>

              <Button
                onClick={() => handleSave("published")}
                disabled={loading}
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-1.5 shadow-md shadow-emerald-600/20 px-6"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Publish to Students</span>
              </Button>
            </div>
          </div>

          {/* Student Preview Box */}
          <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider">
                {selectedSubjectObj?.code} • {formData.unit}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                {formData.difficulty}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {formData.title || "Untitled Note"}
            </h1>

            {formData.description && (
              <p className="text-sm text-slate-600 font-medium">
                {formData.description}
              </p>
            )}

            {formData.learning_objectives && formData.learning_objectives.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1">
                <span className="font-bold text-emerald-900 block">Learning Objectives:</span>
                <ul className="list-disc list-inside space-y-1 text-emerald-950">
                  {formData.learning_objectives.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            )}

            <article className="prose-nexus pt-4 border-t border-slate-100">
              <div
                dangerouslySetInnerHTML={{
                  __html: formData.content
                    ? formData.content
                        .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold pb-2">$1</h1>')
                        .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-emerald-800 mt-4 mb-2">$1</h2>')
                        .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="bg-slate-900 text-emerald-300 p-4 rounded-2xl text-xs font-mono my-3"><code>$2</code></pre>')
                        .replace(/\n\n/gim, '</p><p class="my-2 text-slate-700 text-xs">')
                    : ""
                }}
              />
            </article>
          </div>
        </div>
      )}
    </div>
  )
}
