import type { DifficultyLevel } from "./enums/content";

export type ContentDataAccessMode = "generated_json" | "generated_sql" | "fallback_static";
export type ContentSourceType = "generated" | "fallback";
export type ContentSourceMode = "auto" | ContentDataAccessMode;
export type UserRole = "learner" | "admin";
export type ContentReleaseStatus = "review_approved" | "review_rejected" | "published" | "rolled_back";
export type AdminActionResultStatus = "succeeded" | "failed";

export interface GradeSummary {
  id: number;
  name: string;
  intro: string;
  topicCount: number;
  freeTopicCount: number;
}

export interface GradeDetail extends GradeSummary {}

export interface ModuleSummary {
  id: number;
  gradeId: number;
  name: string;
  intro: string;
  topicCount: number;
}

export interface ModuleDetail extends ModuleSummary {
  gradeName: string;
}

export interface TopicSummary {
  id: number;
  gradeId: number;
  moduleId?: number;
  moduleName?: string;
  name: string;
  intro: string;
  isFree: boolean;
  knowledgePointCount: number;
}

export interface TopicDetail extends TopicSummary {
  gradeName: string;
}

export interface KnowledgePointSummary {
  id: number;
  topicId: number;
  moduleId?: number;
  moduleName?: string;
  name: string;
  intro: string;
  problemFamily?: string;
  questionFamily?: string;
  difficultyLevel: DifficultyLevel;
  durationSec: number;
  isLocked: boolean;
}

export interface KnowledgePointDetail extends KnowledgePointSummary {
  topicName: string;
  transcriptText: string;
  knowledgePointNote?: string;
  audioUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  quizPreviewCount: number;
  spokenScriptText?: string;
}

export interface QuizQuestion {
  id: number;
  knowledgePointId: number;
  type: "single_choice";
  stem: string;
  options: string[];
  answerText?: string;
  analysisText?: string;
}

export interface SearchResultItem {
  entityType: "grade" | "topic" | "knowledge_point";
  id: number;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  gradeId?: number;
  gradeName?: string;
  topicId?: number;
  topicName?: string;
  isFree?: boolean;
  isLocked?: boolean;
}

export interface SearchResultGroup {
  query: string;
  total: number;
  grades: SearchResultItem[];
  topics: SearchResultItem[];
  knowledgePoints: SearchResultItem[];
}

export interface CourseCatalog {
  grades: GradeSummary[];
  modules?: ModuleSummary[];
  topics: TopicSummary[];
  knowledgePoints: KnowledgePointDetail[];
  quizQuestions?: QuizQuestion[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ContentCatalogOverview {
  gradeCount: number;
  topicCount: number;
  knowledgePointCount: number;
  freeTopicCount: number;
  lockedKnowledgePointCount: number;
  dataAccessMode: ContentDataAccessMode;
  sourceType: ContentSourceType;
  sourceWorkbook?: string;
  generatedAt?: string;
  releaseVersionTag?: string;
}

export interface ContentImportSummary {
  sourceWorkbook: string;
  gradeCount: number;
  topicCount: number;
  knowledgePointCount: number;
  freeTopicCount: number;
  quizQuestionCount?: number;
  seedSqlPath?: string;
  sourceType: ContentSourceType;
  generatedAt?: string;
}

export interface RuntimeCheck {
  name: string;
  status: "ok" | "warning" | "error";
  detail: string;
}

export interface SystemHealth {
  status: "ok" | "warning" | "error";
  service: "api";
  timestamp: string;
  apiVersion: string;
  dataAccessMode: ContentDataAccessMode;
  sourceType: ContentSourceType;
  checks: RuntimeCheck[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastActiveAt: string;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: UserProfile;
}

export interface QuizSubmissionAnswerInput {
  questionId: number;
  selectedOption: string;
}

export interface QuizSubmissionRequest {
  answers: QuizSubmissionAnswerInput[];
}

export interface QuizQuestionSubmissionResult {
  questionId: number;
  selectedOption: string;
  correctAnswer?: string;
  isCorrect: boolean;
}

export interface LearningRecord {
  knowledgePointId: number;
  topicId?: number;
  gradeId?: number;
  gradeName?: string;
  moduleName?: string;
  topicName?: string;
  knowledgePointName?: string;
  state?: LearningProgressState;
  startedAt?: string;
  completedAt?: string;
  attemptsCount: number;
  latestScore?: number;
  lastSubmittedAt?: string;
  lastActiveAt?: string;
}

export type LearningProgressState = "not_started" | "in_progress" | "completed";
export type PermissionAccessType = "free" | "trial" | "granted" | "locked";

export interface ProductSummary {
  id: string;
  topicId: number;
  topicName: string;
  priceCents: number;
  currency: string;
  status: "active" | "inactive";
}

export interface CommerceTopicAccess {
  topicId: number;
  topicName: string;
  accessType: PermissionAccessType;
}

export interface CreateOrderRequest {
  productId: string;
}

export interface OrderSummary {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  topicId: number;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
  paidAt?: string;
}

export interface PaymentResult {
  orderId: string;
  paymentStatus: "paid";
  paidAt: string;
}

export interface CommerceOverview {
  products: ProductSummary[];
  topicAccess: CommerceTopicAccess[];
  orders: OrderSummary[];
}

export interface LearningStatus extends LearningRecord {
  isStarted: boolean;
  isCompleted: boolean;
  state: LearningProgressState;
  topicId: number;
  canAccess: boolean;
  accessType: PermissionAccessType;
}

export interface TopicLearningProgress {
  topicId: number;
  gradeId?: number;
  gradeName?: string;
  moduleName?: string;
  topicName?: string;
  startedCount: number;
  completedCount: number;
  totalKnowledgePoints: number;
  completionRate: number;
}

export interface QuizAttemptSummary {
  knowledgePointId: number;
  topicId: number;
  gradeId?: number;
  gradeName?: string;
  moduleName?: string;
  topicName?: string;
  knowledgePointName?: string;
  score: number;
  submittedAt: string;
}

export interface QuizSubmissionResult {
  knowledgePointId: number;
  submittedAt: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  results: QuizQuestionSubmissionResult[];
}

export interface LearningOverview {
  totalStarted: number;
  totalCompleted: number;
  totalQuizAttempts: number;
  averageScore: number;
  continueLearning?: LearningRecord | null;
  recentRecords: LearningRecord[];
  topicProgress: TopicLearningProgress[];
  recentQuizResults: QuizAttemptSummary[];
}

export interface AdminImportReviewRequest {
  action: "approve" | "reject";
  note?: string;
}

export interface AdminPublishRequest {
  versionTag: string;
}

export interface AdminRollbackRequest {
  targetVersionTag: string;
}

export interface AdminImportStatus {
  currentSourceWorkbook: string;
  currentStatus?: ContentReleaseStatus;
  activeVersionTag?: string;
  latestAction?: "approve" | "reject" | "publish" | "rollback";
  latestActionAt?: string;
  latestVersionTag?: string;
  latestNote?: string;
  releaseStatePath?: string;
  approvedAiDraftCount?: number;
  approvedAiContentPath?: string;
  publishedCatalogPath?: string;
  releaseManifestPath?: string;
  mediaManifestPath?: string;
  catalogChecksum?: string;
  recentActions?: AdminActionAuditEntry[];
  lastFailure?: AdminActionAuditEntry;
  videoBatchSummary?: VideoBatchPipelineSummary;
  videoFamilyVerification?: VideoFamilyVerificationSummary;
}

export interface AdminActionAuditEntry {
  id: string;
  action: "approve" | "reject" | "publish" | "rollback";
  actorEmail?: string;
  actorUserId?: string;
  versionTag?: string;
  note?: string;
  resultStatus: AdminActionResultStatus;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface VideoBatchPipelineSummary {
  statePath: string;
  totalBatches: number;
  activeBatches: number;
  activeCanaryBatches: number;
  publishedItems: number;
  readyForReviewItems: number;
  readyForPublishItems: number;
  failedItems: number;
  latestBatchId?: string;
  latestBatchUpdatedAt?: string;
}

export interface VideoFamilyVerificationEntry {
  templateFamily: string;
  templateDisplayName?: string;
  status: "verified" | "verifying" | "unverified";
  publishedCanaryCount: number;
  activeCanaryCount: number;
  latestKnowledgePointId?: number;
  latestKnowledgePointName?: string;
}

export interface VideoFamilyVerificationSummary {
  statePath: string;
  totalFamilies: number;
  verifiedFamilies: number;
  verifyingFamilies: number;
  unverifiedFamilies: number;
  families: VideoFamilyVerificationEntry[];
}

export interface AdminReportOverview {
  registeredUsers: number;
  paidUsers: number;
  trialUsers: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenueCents: number;
  conversionRate: number;
  startedLessons: number;
  completedLessons: number;
}

export interface HotTopicReportItem {
  topicId: number;
  topicName: string;
  startedCount: number;
  completedCount: number;
  paidUserCount: number;
}

export interface AiGeneratedContentDraft {
  id: string;
  draftType: "lecture_script" | "spoken_script" | "quiz_bundle";
  knowledgePointId: number;
  topicId: number;
  title: string;
  status: "pending" | "approved" | "rejected";
  difficultyLevel: string;
  questionType: string;
  tags: string[];
  payload: Record<string, unknown>;
  sourceModel: string;
  versionTag: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiReviewActionRequest {
  action: "approve" | "reject";
  note?: string;
}

export interface AiReviewQueueSummary {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  lectureCount: number;
  quizCount: number;
}
