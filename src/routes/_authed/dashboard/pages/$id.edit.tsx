import { createFileRoute, Link } from "@tanstack/react-router";
import { useReducer, useState, useCallback, useMemo, useRef, useEffect, type KeyboardEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Code,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Image,
  LayoutTemplate,
  ListChecks,
  MessageSquareQuote,
  Monitor,

  MousePointerClick,
  Pencil,
  Play,
  Plus,
  Search,
  Settings2,
  Smartphone,
  Sparkles,
  Star,
  Tablet,
  Trash2,
  Type,
  User,
  X,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authed/dashboard/pages/$id/edit")({
  component: PageBuilderPage,
});

// -- Types ------------------------------------------------------------------

type BlockType =
  | "hero"
  | "features"
  | "testimonials"
  | "pricing"
  | "cta"
  | "faq"
  | "richtext"
  | "image"
  | "video"
  | "countdown"
  | "instructor"
  | "curriculum"
  | "html";

type SocialLink = {
  readonly label: string;
  readonly url: string;
};

type BlockProps = {
  readonly heading?: string;
  readonly body?: string;
  readonly buttonText?: string;
  readonly buttonUrl?: string;
  readonly imageUrl?: string;
  readonly backgroundColor?: string;
  readonly items?: ReadonlyArray<{
    readonly title: string;
    readonly description: string;
  }>;
  readonly videoUrl?: string;
  readonly targetDate?: string;
  readonly instructorName?: string;
  readonly instructorTitle?: string;
  readonly instructorPhotoUrl?: string;
  readonly socialLinks?: ReadonlyArray<SocialLink>;
  readonly highlightIndex?: number;
  readonly courseId?: string;
  readonly htmlContent?: string;
};

type Block = {
  readonly id: string;
  readonly type: BlockType;
  readonly props: BlockProps;
};

type SeoSettings = {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly ogImageUrl: string;
  readonly canonicalUrl: string;
  readonly noindex: boolean;
};

type PreviewViewport = "desktop" | "tablet" | "mobile";

type PageBuilderState = {
  readonly pageTitle: string;
  readonly blocks: readonly Block[];
  readonly selectedBlockId: string | null;
  readonly seo: SeoSettings;
  readonly isDirty: boolean;
  readonly isPreviewMode: boolean;
  readonly previewViewport: PreviewViewport;
};

// -- Actions ----------------------------------------------------------------

type PageBuilderAction =
  | { readonly type: "SET_TITLE"; readonly payload: string }
  | { readonly type: "ADD_BLOCK"; readonly payload: { readonly blockType: BlockType } }
  | { readonly type: "DELETE_BLOCK"; readonly payload: { readonly blockId: string } }
  | { readonly type: "SELECT_BLOCK"; readonly payload: { readonly blockId: string | null } }
  | { readonly type: "REORDER_BLOCKS"; readonly payload: { readonly activeId: string; readonly overId: string } }
  | { readonly type: "UPDATE_BLOCK_PROPS"; readonly payload: { readonly blockId: string; readonly props: Partial<BlockProps> } }
  | { readonly type: "UPDATE_SEO"; readonly payload: Partial<SeoSettings> }
  | { readonly type: "TOGGLE_PREVIEW" }
  | { readonly type: "SET_VIEWPORT"; readonly payload: PreviewViewport }
  | { readonly type: "LOAD_TEMPLATE"; readonly payload: readonly Block[] }
  | { readonly type: "MARK_SAVED" }
  | { readonly type: "LOAD_PAGE"; readonly payload: { readonly title: string; readonly blocks: readonly Block[]; readonly seo: SeoSettings } };

// -- Helpers ----------------------------------------------------------------

let blockCounter = 100;

const createBlockId = (): string => {
  blockCounter += 1;
  return `block-${blockCounter}`;
};

const getDefaultProps = (blockType: BlockType): BlockProps => {
  switch (blockType) {
    case "hero": {
      return {
        heading: "Transform Your Skills Today",
        body: "Join thousands of students mastering new techniques with our expert-led courses.",
        buttonText: "Get Started",
        buttonUrl: "#pricing",
        backgroundColor: "#0f172a",
      };
    }
    case "features": {
      return {
        heading: "Why Choose Us",
        items: [
          { title: "Expert Instructors", description: "Learn from industry professionals with years of experience." },
          { title: "Self-Paced Learning", description: "Study on your own schedule, anywhere in the world." },
          { title: "Certificate of Completion", description: "Earn a recognized certificate when you finish." },
        ],
        backgroundColor: "#ffffff",
      };
    }
    case "testimonials": {
      return {
        heading: "What Students Say",
        items: [
          { title: "Sarah K.", description: "This course completely changed my approach to cinematography. Highly recommended!" },
          { title: "James T.", description: "The best investment I have made in my filmmaking career." },
          { title: "Maria L.", description: "Clear, structured, and incredibly practical. Five stars." },
        ],
        backgroundColor: "#f8fafc",
      };
    }
    case "pricing": {
      return {
        heading: "Simple, Transparent Pricing",
        body: "Choose the plan that works best for you.",
        buttonText: "Choose Plan",
        items: [
          { title: "Starter -- $29/mo", description: "Access to 3 courses, community forum, email support." },
          { title: "Pro -- $79/mo", description: "Unlimited courses, priority support, downloadable resources." },
          { title: "Enterprise -- $199/mo", description: "Everything in Pro plus custom branding, API access, and dedicated support." },
        ],
        highlightIndex: 1,
        backgroundColor: "#ffffff",
      };
    }
    case "cta": {
      return {
        heading: "Ready to Start Learning?",
        body: "Enroll now and get instant access to all course materials.",
        buttonText: "Enroll Now",
        buttonUrl: "#",
        backgroundColor: "#1e40af",
      };
    }
    case "faq": {
      return {
        heading: "Frequently Asked Questions",
        items: [
          { title: "How long do I have access?", description: "You get lifetime access to all course materials after enrollment." },
          { title: "Is there a refund policy?", description: "Yes, we offer a 30-day money-back guarantee, no questions asked." },
          { title: "Can I download the videos?", description: "Pro plan subscribers can download videos for offline viewing." },
        ],
        backgroundColor: "#ffffff",
      };
    }
    case "richtext": {
      return {
        heading: "About This Course",
        body: "This comprehensive course covers everything from fundamentals to advanced techniques. You will work on real-world projects and build a professional portfolio by the end of the program.",
        backgroundColor: "#ffffff",
      };
    }
    case "image": {
      return {
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=600&fit=crop",
        heading: "Behind the Scenes",
        backgroundColor: "#000000",
      };
    }
    case "video": {
      return {
        heading: "Watch the Intro",
        videoUrl: "",
        backgroundColor: "#000000",
      };
    }
    case "countdown": {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      return {
        heading: "Enrollment Closes In",
        targetDate: defaultDate.toISOString().slice(0, 16),
        backgroundColor: "#1e293b",
      };
    }
    case "instructor": {
      return {
        instructorName: "Jane Doe",
        instructorTitle: "Professional Filmmaker & Educator",
        body: "With over 15 years of experience in the film industry, Jane has worked on award-winning documentaries and feature films. She is passionate about sharing her knowledge with aspiring filmmakers.",
        instructorPhotoUrl: "",
        socialLinks: [
          { label: "Website", url: "" },
          { label: "Twitter", url: "" },
        ],
        backgroundColor: "#ffffff",
      };
    }
    case "curriculum": {
      return {
        heading: "Course Curriculum",
        courseId: "",
        items: [
          { title: "Module 1: Getting Started", description: "3 lessons" },
          { title: "Module 2: Core Concepts", description: "5 lessons" },
          { title: "Module 3: Advanced Techniques", description: "4 lessons" },
        ],
        backgroundColor: "#ffffff",
      };
    }
    case "html": {
      return {
        heading: "Custom Content",
        htmlContent: "<div style=\"text-align:center;padding:2rem;\"><p>Your custom HTML here</p></div>",
        backgroundColor: "#ffffff",
      };
    }
    default: {
      return { heading: "New Block", backgroundColor: "#ffffff" };
    }
  }
};

const BLOCK_PALETTE: ReadonlyArray<{
  readonly type: BlockType;
  readonly label: string;
  readonly icon: typeof LayoutTemplate;
  readonly description: string;
}> = [
  { type: "hero", label: "Hero", icon: Sparkles, description: "Full-width hero section with heading and CTA" },
  { type: "features", label: "Features", icon: ListChecks, description: "Feature grid with icons and descriptions" },
  { type: "testimonials", label: "Testimonials", icon: MessageSquareQuote, description: "Student testimonials carousel" },
  { type: "pricing", label: "Pricing", icon: CreditCard, description: "Pricing plans comparison" },
  { type: "cta", label: "CTA", icon: MousePointerClick, description: "Call-to-action banner" },
  { type: "faq", label: "FAQ", icon: HelpCircle, description: "Frequently asked questions accordion" },
  { type: "richtext", label: "Rich Text", icon: Type, description: "Free-form text content block" },
  { type: "image", label: "Image", icon: Image, description: "Full-width or contained image" },
  { type: "video", label: "Video", icon: Play, description: "Embedded video player" },
  { type: "countdown", label: "Countdown", icon: Clock, description: "Countdown timer to a target date" },
  { type: "instructor", label: "Instructor", icon: User, description: "Instructor bio card" },
  { type: "curriculum", label: "Curriculum", icon: BookOpen, description: "Course outline with modules and lessons" },
  { type: "html", label: "Custom HTML", icon: Code, description: "Custom HTML content block" },
];

// -- Reducer ----------------------------------------------------------------

const pageBuilderReducer = (
  state: PageBuilderState,
  action: PageBuilderAction,
): PageBuilderState => {
  switch (action.type) {
    case "SET_TITLE": {
      return { ...state, pageTitle: action.payload, isDirty: true };
    }
    case "ADD_BLOCK": {
      const newBlock: Block = {
        id: createBlockId(),
        type: action.payload.blockType,
        props: getDefaultProps(action.payload.blockType),
      };
      return {
        ...state,
        blocks: [...state.blocks, newBlock],
        selectedBlockId: newBlock.id,
        isDirty: true,
      };
    }
    case "DELETE_BLOCK": {
      const filtered = state.blocks.filter((b) => b.id !== action.payload.blockId);
      return {
        ...state,
        blocks: filtered,
        selectedBlockId:
          state.selectedBlockId === action.payload.blockId
            ? null
            : state.selectedBlockId,
        isDirty: true,
      };
    }
    case "SELECT_BLOCK": {
      return { ...state, selectedBlockId: action.payload.blockId };
    }
    case "REORDER_BLOCKS": {
      const oldIndex = state.blocks.findIndex((b) => b.id === action.payload.activeId);
      const newIndex = state.blocks.findIndex((b) => b.id === action.payload.overId);
      if (oldIndex === -1 || newIndex === -1) { return state; }
      return {
        ...state,
        blocks: arrayMove([...state.blocks], oldIndex, newIndex),
        isDirty: true,
      };
    }
    case "UPDATE_BLOCK_PROPS": {
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.payload.blockId
            ? { ...b, props: { ...b.props, ...action.payload.props } }
            : b,
        ),
        isDirty: true,
      };
    }
    case "UPDATE_SEO": {
      return {
        ...state,
        seo: { ...state.seo, ...action.payload },
        isDirty: true,
      };
    }
    case "TOGGLE_PREVIEW": {
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode,
        selectedBlockId: !state.isPreviewMode ? null : state.selectedBlockId,
      };
    }
    case "SET_VIEWPORT": {
      return { ...state, previewViewport: action.payload };
    }
    case "LOAD_TEMPLATE": {
      return {
        ...state,
        blocks: action.payload,
        selectedBlockId: null,
        isDirty: true,
      };
    }
    case "MARK_SAVED": {
      return { ...state, isDirty: false };
    }
    case "LOAD_PAGE": {
      return {
        ...state,
        pageTitle: action.payload.title,
        blocks: action.payload.blocks,
        seo: action.payload.seo,
        selectedBlockId: null,
        isDirty: false,
      };
    }
    default: {
      return state;
    }
  }
};

// -- Initial state ----------------------------------------------------------

const INITIAL_STATE: PageBuilderState = {
  pageTitle: "Cinematic Masterclass",
  blocks: [
    { id: "block-1", type: "hero", props: getDefaultProps("hero") },
    { id: "block-2", type: "features", props: getDefaultProps("features") },
    { id: "block-3", type: "testimonials", props: getDefaultProps("testimonials") },
    { id: "block-4", type: "cta", props: getDefaultProps("cta") },
  ],
  selectedBlockId: null,
  seo: {
    metaTitle: "Cinematic Masterclass - Learn Professional Filmmaking",
    metaDescription: "Master the art of cinematic storytelling with expert-led courses covering lighting, color grading, and more.",
    ogImageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=630&fit=crop",
    canonicalUrl: "",
    noindex: false,
  },
  isDirty: false,
  isPreviewMode: false,
  previewViewport: "desktop",
};

// -- Page Templates ---------------------------------------------------------

type PageTemplate = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: typeof LayoutTemplate;
  readonly blocks: readonly Block[];
};

const PAGE_TEMPLATES: readonly PageTemplate[] = [
  {
    id: "course-sales",
    name: "Course Sales Page",
    description: "Hero, curriculum, testimonials, pricing, and FAQ",
    icon: CreditCard,
    blocks: [
      { id: "t-1", type: "hero", props: getDefaultProps("hero") },
      { id: "t-2", type: "curriculum", props: getDefaultProps("curriculum") },
      { id: "t-3", type: "testimonials", props: getDefaultProps("testimonials") },
      { id: "t-4", type: "pricing", props: getDefaultProps("pricing") },
      { id: "t-5", type: "faq", props: getDefaultProps("faq") },
    ],
  },
  {
    id: "lead-magnet",
    name: "Free Lead Magnet",
    description: "Hero, features, and call-to-action",
    icon: Sparkles,
    blocks: [
      { id: "t-1", type: "hero", props: { ...getDefaultProps("hero"), heading: "Get Your Free Guide", buttonText: "Download Now" } },
      { id: "t-2", type: "features", props: { ...getDefaultProps("features"), heading: "What You Will Learn" } },
      { id: "t-3", type: "cta", props: { ...getDefaultProps("cta"), heading: "Download Your Free Copy", buttonText: "Get Free Access" } },
    ],
  },
  {
    id: "webinar",
    name: "Webinar Registration",
    description: "Countdown, instructor bio, features, FAQ, and CTA",
    icon: Clock,
    blocks: [
      { id: "t-1", type: "countdown", props: { ...getDefaultProps("countdown"), heading: "Live Webinar Starts In", buttonText: "Register Now", backgroundColor: "#0f172a" } },
      { id: "t-2", type: "instructor", props: { ...getDefaultProps("instructor"), instructorName: "Your Name", instructorTitle: "Expert Instructor & Industry Leader" } },
      { id: "t-3", type: "features", props: { ...getDefaultProps("features"), heading: "What You Will Discover", items: [
        { title: "Proven Strategies", description: "Learn the exact frameworks used by top professionals." },
        { title: "Live Q&A Session", description: "Get your questions answered in real time during the webinar." },
        { title: "Exclusive Bonus", description: "Attendees receive a free downloadable resource pack." },
      ] } },
      { id: "t-4", type: "faq", props: { ...getDefaultProps("faq"), heading: "Webinar FAQ", items: [
        { title: "Is the webinar free?", description: "Yes, the webinar is completely free to attend. Just register to save your spot." },
        { title: "Will there be a replay?", description: "A replay will be available for 48 hours after the live session." },
        { title: "What if I have more questions?", description: "You can ask questions during the live Q&A at the end of the webinar." },
      ] } },
      { id: "t-5", type: "cta", props: { ...getDefaultProps("cta"), heading: "Reserve Your Seat", body: "Spots are limited. Register now to guarantee your place.", buttonText: "Register Free" } },
    ],
  },
  {
    id: "coming-soon",
    name: "Coming Soon",
    description: "Countdown, hero, features preview, and email CTA",
    icon: Eye,
    blocks: [
      { id: "t-1", type: "hero", props: { ...getDefaultProps("hero"), heading: "Something Amazing Is Coming", body: "A brand-new course experience designed to transform how you learn. Be the first to know when we launch.", buttonText: "Join the Waitlist", backgroundColor: "#0f172a" } },
      { id: "t-2", type: "countdown", props: { ...getDefaultProps("countdown"), heading: "Launching In" } },
      { id: "t-3", type: "features", props: { ...getDefaultProps("features"), heading: "What to Expect", items: [
        { title: "Premium Content", description: "Hours of expert-led video lessons and hands-on projects." },
        { title: "Community Access", description: "Join a private community of motivated learners." },
        { title: "Early Bird Pricing", description: "Waitlist members get an exclusive launch discount." },
      ] } },
      { id: "t-4", type: "cta", props: { ...getDefaultProps("cta"), heading: "Do Not Miss the Launch", body: "Join the waitlist to get early access and a special discount.", buttonText: "Notify Me" } },
    ],
  },
  {
    id: "about-instructor",
    name: "About / Instructor",
    description: "Instructor bio, expertise, testimonials, and story",
    icon: User,
    blocks: [
      { id: "t-1", type: "instructor", props: { ...getDefaultProps("instructor"), instructorName: "Your Name", instructorTitle: "Your Title & Expertise", body: "Share a compelling summary about yourself, your background, and why students love learning from you." } },
      { id: "t-2", type: "features", props: { ...getDefaultProps("features"), heading: "Areas of Expertise", items: [
        { title: "Skill Area 1", description: "Describe your first area of deep expertise." },
        { title: "Skill Area 2", description: "Describe your second area of deep expertise." },
        { title: "Skill Area 3", description: "Describe your third area of deep expertise." },
      ] } },
      { id: "t-3", type: "testimonials", props: { ...getDefaultProps("testimonials"), heading: "What Students Say About Me" } },
      { id: "t-4", type: "richtext", props: { ...getDefaultProps("richtext"), heading: "My Story", body: "Share your journey and what drives you as an educator. Talk about your background, key milestones, and the impact you want to make through teaching.", backgroundColor: "#f8fafc" } },
      { id: "t-5", type: "cta", props: { ...getDefaultProps("cta"), heading: "Ready to Learn With Me?", body: "Check out my courses and start your journey today.", buttonText: "View My Courses" } },
    ],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean hero, single feature block, and CTA",
    icon: LayoutTemplate,
    blocks: [
      { id: "t-1", type: "hero", props: { ...getDefaultProps("hero"), heading: "Learn Something New", body: "A focused, no-nonsense course to help you level up fast.", buttonText: "Start Now" } },
      { id: "t-2", type: "features", props: { ...getDefaultProps("features"), heading: "What You Get", items: [
        { title: "Video Lessons", description: "Concise, actionable video content." },
        { title: "Practical Exercises", description: "Hands-on assignments to reinforce learning." },
        { title: "Lifetime Access", description: "Learn at your own pace, forever." },
      ] } },
      { id: "t-3", type: "cta", props: { ...getDefaultProps("cta"), heading: "Start Learning Today", body: "No fluff. Just results.", buttonText: "Enroll Now" } },
    ],
  },
];

// -- Block preview components -----------------------------------------------

function HeroBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-16 text-center text-white"
      style={{ backgroundColor: props.backgroundColor ?? "#0f172a" }}
    >
      <h2 className="font-bold text-2xl">{props.heading}</h2>
      {props.body && (
        <p className="mt-3 max-w-lg text-sm opacity-80">{props.body}</p>
      )}
      {props.buttonText && (
        <span className="mt-6 inline-block rounded-md bg-white px-5 py-2 font-medium text-slate-900 text-sm">
          {props.buttonText}
        </span>
      )}
    </div>
  );
}

function FeaturesBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div className="px-6 py-12" style={{ backgroundColor: props.backgroundColor ?? "#ffffff" }}>
      <h3 className="text-center font-bold text-lg">{props.heading}</h3>
      {props.items && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {props.items.map((item) => (
            <div key={item.title} className="rounded-lg border p-4 text-center">
              <Star className="mx-auto size-6 text-primary" />
              <p className="mt-2 font-semibold text-sm">{item.title}</p>
              <p className="mt-1 text-muted-foreground text-xs">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialsBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div className="px-6 py-12" style={{ backgroundColor: props.backgroundColor ?? "#f8fafc" }}>
      <h3 className="text-center font-bold text-lg">{props.heading}</h3>
      {props.items && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {props.items.map((item) => (
            <div key={item.title} className="rounded-lg border bg-white p-4">
              <div className="flex gap-0.5">
                {["s1", "s2", "s3", "s4", "s5"].map((starId) => (
                  <Star key={starId} className="size-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-2 text-muted-foreground text-xs italic">
                {`"${item.description}"`}
              </p>
              <p className="mt-2 font-semibold text-xs">{item.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PricingBlockPreview({ props }: { readonly props: BlockProps }) {
  const highlightIdx = props.highlightIndex ?? -1;
  const columnClass = props.items && props.items.length >= 3
    ? "sm:grid-cols-3"
    : "sm:grid-cols-2";

  return (
    <div className="px-6 py-12" style={{ backgroundColor: props.backgroundColor ?? "#ffffff" }}>
      <h3 className="text-center font-bold text-lg">{props.heading}</h3>
      {props.body && (
        <p className="mt-1 text-center text-muted-foreground text-sm">{props.body}</p>
      )}
      {props.items && (
        <div className={`mx-auto mt-6 grid max-w-3xl gap-4 ${columnClass}`}>
          {props.items.map((item, index) => {
            const isHighlighted = index === highlightIdx;
            return (
              <div
                key={item.title}
                className={`relative rounded-lg border p-5 text-center transition-shadow ${
                  isHighlighted
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {isHighlighted && (
                  <span className="-top-3 absolute inset-x-0 mx-auto w-fit rounded-full bg-primary px-3 py-0.5 font-semibold text-primary-foreground text-[10px] uppercase tracking-wide">
                    Recommended
                  </span>
                )}
                <p className="font-bold text-sm">{item.title}</p>
                <p className="mt-2 text-muted-foreground text-xs">{item.description}</p>
                <span
                  className={`mt-4 inline-block rounded-md px-4 py-1.5 font-medium text-xs ${
                    isHighlighted
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {props.buttonText ?? "Choose Plan"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CtaBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-14 text-center text-white"
      style={{ backgroundColor: props.backgroundColor ?? "#1e40af" }}
    >
      <h3 className="font-bold text-xl">{props.heading}</h3>
      {props.body && (
        <p className="mt-2 max-w-md text-sm opacity-80">{props.body}</p>
      )}
      {props.buttonText && (
        <span className="mt-5 inline-block rounded-md bg-white px-5 py-2 font-medium text-slate-900 text-sm">
          {props.buttonText}
        </span>
      )}
    </div>
  );
}

function FaqAccordionItem({ item }: { readonly item: { readonly title: string; readonly description: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [item.description]);

  const toggle = () => setIsOpen((prev) => !prev);
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 text-left"
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-sm">{item.title}</span>
        {isOpen ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
        style={{ maxHeight: isOpen ? `${String(contentHeight)}px` : "0px" }}
      >
        <div ref={contentRef} className="px-4 pb-4">
          <p className="text-muted-foreground text-xs leading-relaxed">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

function FaqBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div className="px-6 py-12" style={{ backgroundColor: props.backgroundColor ?? "#ffffff" }}>
      <h3 className="text-center font-bold text-lg">{props.heading}</h3>
      {props.items && (
        <div className="mx-auto mt-6 max-w-lg space-y-2">
          {props.items.map((item) => (
            <FaqAccordionItem key={item.title} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function RichTextBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div className="px-6 py-10" style={{ backgroundColor: props.backgroundColor ?? "#ffffff" }}>
      {props.heading && (
        <h3 className="font-bold text-lg">{props.heading}</h3>
      )}
      {props.body && (
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{props.body}</p>
      )}
    </div>
  );
}

function ImageBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div className="px-6 py-8" style={{ backgroundColor: props.backgroundColor ?? "#000000" }}>
      {props.heading && (
        <p className="mb-3 text-center font-medium text-sm text-white">{props.heading}</p>
      )}
      {props.imageUrl ? (
        // biome-ignore lint/performance/noImgElement: Not a Next.js project (TanStack Start)
        <img
          src={props.imageUrl}
          alt={props.heading ?? "Landing page content"}
          width={1200}
          height={600}
          className="mx-auto max-h-64 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-white/20 border-dashed">
          <Image className="size-8 text-white/40" />
        </div>
      )}
    </div>
  );
}

function VideoBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div className="px-6 py-10" style={{ backgroundColor: props.backgroundColor ?? "#000000" }}>
      {props.heading && (
        <h3 className="mb-4 text-center font-bold text-lg text-white">{props.heading}</h3>
      )}
      {props.videoUrl ? (
        <div className="mx-auto max-w-2xl overflow-hidden rounded-lg">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={props.videoUrl}
              title={props.heading ?? "Embedded video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto flex h-48 max-w-2xl items-center justify-center rounded-lg border-2 border-white/20 border-dashed">
          <div className="text-center">
            <Play className="mx-auto size-10 text-white/40" />
            <p className="mt-2 text-sm text-white/50">Enter a video URL to embed</p>
          </div>
        </div>
      )}
    </div>
  );
}

function useCountdown(targetDate: string | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1_000);
    return () => clearInterval(interval);
  }, []);

  const target = targetDate ? new Date(targetDate).getTime() : 0;
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1_000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1_000 * 60 * 60 * 24)) / (1_000 * 60 * 60)),
    minutes: Math.floor((diff % (1_000 * 60 * 60)) / (1_000 * 60)),
    seconds: Math.floor((diff % (1_000 * 60)) / 1_000),
    isExpired: diff === 0 && target > 0,
  };
}

function CountdownBlockPreview({ props }: { readonly props: BlockProps }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(props.targetDate);

  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-14 text-center text-white"
      style={{ backgroundColor: props.backgroundColor ?? "#1e293b" }}
    >
      <h3 className="font-bold text-xl">{props.heading}</h3>
      {isExpired ? (
        <p className="mt-6 font-medium text-lg opacity-80">This event has started!</p>
      ) : (
        <div className="mt-6 flex gap-4">
          {units.map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <span className="flex size-16 items-center justify-center rounded-lg bg-white/10 font-bold text-2xl tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="mt-1.5 text-xs uppercase opacity-60">{unit.label}</span>
            </div>
          ))}
        </div>
      )}
      {props.buttonText && (
        <span className="mt-6 inline-block rounded-md bg-white px-5 py-2 font-medium text-slate-900 text-sm">
          {props.buttonText}
        </span>
      )}
    </div>
  );
}

function InstructorBlockPreview({ props }: { readonly props: BlockProps }) {
  const visibleLinks = (props.socialLinks ?? []).filter((link) => link.url.length > 0);

  return (
    <div className="px-6 py-12" style={{ backgroundColor: props.backgroundColor ?? "#ffffff" }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 sm:flex-row sm:items-start">
        {props.instructorPhotoUrl ? (
          // biome-ignore lint/performance/noImgElement: Not a Next.js project
          <img
            src={props.instructorPhotoUrl}
            alt={`${props.instructorName ?? "Instructor"}`}
            className="size-28 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-28 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="size-12 text-muted-foreground" />
          </div>
        )}
        <div>
          <h3 className="font-bold text-xl">{props.instructorName}</h3>
          {props.instructorTitle && (
            <p className="mt-1 font-medium text-primary text-sm">{props.instructorTitle}</p>
          )}
          {props.body && (
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{props.body}</p>
          )}
          {visibleLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {visibleLinks.map((link) => (
                <span
                  key={link.label}
                  className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  <ExternalLink className="size-3" />
                  {link.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CurriculumBlockPreview({ props }: { readonly props: BlockProps }) {
  return (
    <div className="px-6 py-12" style={{ backgroundColor: props.backgroundColor ?? "#ffffff" }}>
      <h3 className="text-center font-bold text-lg">{props.heading}</h3>
      {props.items && (
        <div className="mx-auto mt-6 max-w-lg space-y-2">
          {props.items.map((item, index) => (
            <div key={item.title} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-sm">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-muted-foreground text-xs">{item.description}</p>
              </div>
              <BookOpen className="size-4 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HtmlBlockPreview({ props }: { readonly props: BlockProps }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlContent = props.htmlContent ?? "";

  return (
    <div className="px-6 py-8" style={{ backgroundColor: props.backgroundColor ?? "#ffffff" }}>
      {props.heading && (
        <h3 className="mb-3 font-bold text-lg">{props.heading}</h3>
      )}
      {htmlContent ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          title={props.heading ?? "Custom HTML content"}
          className="w-full rounded-lg border"
          style={{ minHeight: "120px" }}
          sandbox="allow-scripts"
        />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground text-sm">Enter HTML content in the settings panel</p>
        </div>
      )}
    </div>
  );
}

function BlockPreview({ block }: { readonly block: Block }) {
  switch (block.type) {
    case "hero": return <HeroBlockPreview props={block.props} />;
    case "features": return <FeaturesBlockPreview props={block.props} />;
    case "testimonials": return <TestimonialsBlockPreview props={block.props} />;
    case "pricing": return <PricingBlockPreview props={block.props} />;
    case "cta": return <CtaBlockPreview props={block.props} />;
    case "faq": return <FaqBlockPreview props={block.props} />;
    case "richtext": return <RichTextBlockPreview props={block.props} />;
    case "image": return <ImageBlockPreview props={block.props} />;
    case "video": return <VideoBlockPreview props={block.props} />;
    case "countdown": return <CountdownBlockPreview props={block.props} />;
    case "instructor": return <InstructorBlockPreview props={block.props} />;
    case "curriculum": return <CurriculumBlockPreview props={block.props} />;
    case "html": return <HtmlBlockPreview props={block.props} />;
    default: return <RichTextBlockPreview props={block.props} />;
  }
}

// -- Block type labels ------------------------------------------------------

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  features: "Features",
  testimonials: "Testimonials",
  pricing: "Pricing",
  cta: "CTA",
  faq: "FAQ",
  richtext: "Rich Text",
  image: "Image",
  video: "Video",
  countdown: "Countdown",
  instructor: "Instructor",
  curriculum: "Curriculum",
  html: "Custom HTML",
};

// -- Left Sidebar: Block Palette --------------------------------------------

type BlockPalettePanelProps = {
  readonly onAddBlock: (blockType: BlockType) => void;
};

function BlockPalettePanel({ onAddBlock }: BlockPalettePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlocks = BLOCK_PALETTE.filter((b) =>
    b.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-muted/30">
      <div className="border-b px-3 py-3">
        <h2 className="font-semibold text-sm">Blocks</h2>
        <div className="relative mt-2">
          <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
            aria-label="Search available block types"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-2 p-3">
          {filteredBlocks.map((blockDef) => {
            const Icon = blockDef.icon;
            return (
              <button
                key={blockDef.type}
                type="button"
                className="flex flex-col items-center gap-1.5 rounded-lg border bg-background p-3 text-center transition-colors hover:border-primary hover:bg-accent"
                onClick={() => onAddBlock(blockDef.type)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAddBlock(blockDef.type);
                  }
                }}
                aria-label={`Add ${blockDef.label} block`}
              >
                <Icon className="size-5 text-muted-foreground" />
                <span className="font-medium text-xs">{blockDef.label}</span>
              </button>
            );
          })}
        </div>
        {filteredBlocks.length === 0 && (
          <p className="px-3 py-6 text-center text-muted-foreground text-xs">
            No blocks match your search.
          </p>
        )}
      </ScrollArea>
    </aside>
  );
}

// -- Sortable Block Wrapper -------------------------------------------------

type SortableBlockWrapperProps = {
  readonly block: Block;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly onDelete: () => void;
};

function SortableBlockWrapper({
  block,
  isSelected,
  onSelect,
  onDelete,
}: SortableBlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border-2 transition-colors ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-transparent hover:border-muted-foreground/30"
      }`}
    >
      {/* Block type badge with drag handle */}
      <div className="-top-3 absolute left-3 z-10">
        <Badge variant="secondary" className="cursor-grab text-[10px] shadow-sm active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="mr-0.5 size-3" />
          {BLOCK_TYPE_LABELS[block.type]}
        </Badge>
      </div>

      {/* Action buttons on hover */}
      <div className="-top-3 absolute right-3 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="size-6 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              onDelete();
            }
          }}
          aria-label="Delete block"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Clickable content area */}
      <button
        type="button"
        className="w-full text-left"
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-label={`${BLOCK_TYPE_LABELS[block.type]} block. Click to select.`}
        aria-pressed={isSelected}
      >
        <div className="overflow-hidden rounded-md">
          <BlockPreview block={block} />
        </div>
      </button>
    </div>
  );
}

// -- Center: Canvas ---------------------------------------------------------

type CanvasPanelProps = {
  readonly blocks: readonly Block[];
  readonly selectedBlockId: string | null;
  readonly dispatch: React.ActionDispatch<[action: PageBuilderAction]>;
};

function CanvasPanel({ blocks, selectedBlockId, dispatch }: CanvasPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        dispatch({
          type: "REORDER_BLOCKS",
          payload: { activeId: String(active.id), overId: String(over.id) },
        });
      }
    },
    [dispatch],
  );

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/25 py-20">
            <LayoutTemplate className="size-12 text-muted-foreground/50" />
            <div className="text-center">
              <p className="font-medium text-sm">No blocks yet</p>
              <p className="mt-1 text-muted-foreground text-xs">
                Click a block type from the left panel to add it to your page.
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlockWrapper
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() =>
                    dispatch({ type: "SELECT_BLOCK", payload: { blockId: block.id } })
                  }
                  onDelete={() =>
                    dispatch({ type: "DELETE_BLOCK", payload: { blockId: block.id } })
                  }
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {blocks.length > 0 && (
          <div className="flex justify-center pb-8">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                dispatch({ type: "ADD_BLOCK", payload: { blockType: "richtext" } })
              }
            >
              <Plus className="size-3.5" />
              Add Block
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// -- Right Sidebar: Block Settings ------------------------------------------

type BlockSettingsPanelProps = {
  readonly block: Block | undefined;
  readonly dispatch: React.ActionDispatch<[action: PageBuilderAction]>;
};

function BlockSettingsPanel({ block, dispatch }: BlockSettingsPanelProps) {
  if (!block) {
    return (
      <aside className="flex h-full w-72 shrink-0 flex-col border-l bg-muted/30">
        <div className="border-b px-3 py-3">
          <h2 className="font-semibold text-sm">Block Settings</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Settings2 className="size-8 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            Select a block on the canvas to edit its settings.
          </p>
        </div>
      </aside>
    );
  }

  const updateProp = (key: keyof BlockProps, value: string) => {
    dispatch({
      type: "UPDATE_BLOCK_PROPS",
      payload: { blockId: block.id, props: { [key]: value } },
    });
  };

  const updateProps = (props: Partial<BlockProps>) => {
    dispatch({
      type: "UPDATE_BLOCK_PROPS",
      payload: { blockId: block.id, props },
    });
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l bg-muted/30">
      <div className="flex items-center justify-between border-b px-3 py-3">
        <div>
          <h2 className="font-semibold text-sm">Block Settings</h2>
          <p className="text-muted-foreground text-xs">
            {BLOCK_TYPE_LABELS[block.type]}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() =>
            dispatch({ type: "SELECT_BLOCK", payload: { blockId: null } })
          }
          aria-label="Deselect block"
        >
          <X className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {/* Heading */}
          {block.props.heading !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-heading">Heading</Label>
              <Input
                id="block-heading"
                value={block.props.heading}
                onChange={(e) => updateProp("heading", e.target.value)}
                maxLength={200}
              />
            </div>
          )}

          {/* Body */}
          {block.props.body !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-body">Body Text</Label>
              <Textarea
                id="block-body"
                value={block.props.body}
                onChange={(e) => updateProp("body", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Button text */}
          {block.props.buttonText !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-button-text">Button Text</Label>
              <Input
                id="block-button-text"
                value={block.props.buttonText}
                onChange={(e) => updateProp("buttonText", e.target.value)}
                maxLength={50}
              />
            </div>
          )}

          {/* Button URL */}
          {block.props.buttonUrl !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-button-url">Button URL</Label>
              <Input
                id="block-button-url"
                value={block.props.buttonUrl}
                onChange={(e) => updateProp("buttonUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Image URL */}
          {block.props.imageUrl !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-image-url">Image URL</Label>
              <Input
                id="block-image-url"
                value={block.props.imageUrl}
                onChange={(e) => updateProp("imageUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Video URL */}
          {block.props.videoUrl !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-video-url">Video URL</Label>
              <Input
                id="block-video-url"
                value={block.props.videoUrl}
                onChange={(e) => updateProp("videoUrl", e.target.value)}
                placeholder="https://youtube.com/embed/... or https://player.vimeo.com/video/..."
              />
              <p className="text-muted-foreground text-xs">
                Use embed URLs from YouTube, Vimeo, or Mux
              </p>
            </div>
          )}

          {/* Target date for countdown */}
          {block.props.targetDate !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-target-date">Target Date</Label>
              <Input
                id="block-target-date"
                type="datetime-local"
                value={block.props.targetDate}
                onChange={(e) => updateProp("targetDate", e.target.value)}
              />
            </div>
          )}

          {/* Instructor fields */}
          {block.props.instructorName !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-instructor-name">Instructor Name</Label>
              <Input
                id="block-instructor-name"
                value={block.props.instructorName}
                onChange={(e) => updateProp("instructorName", e.target.value)}
                maxLength={100}
              />
            </div>
          )}
          {block.props.instructorTitle !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-instructor-title">Instructor Title</Label>
              <Input
                id="block-instructor-title"
                value={block.props.instructorTitle}
                onChange={(e) => updateProp("instructorTitle", e.target.value)}
                maxLength={150}
              />
            </div>
          )}
          {block.props.instructorPhotoUrl !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-instructor-photo">Photo URL</Label>
              <Input
                id="block-instructor-photo"
                value={block.props.instructorPhotoUrl}
                onChange={(e) => updateProp("instructorPhotoUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Course ID for curriculum */}
          {block.props.courseId !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-course-id">Course ID</Label>
              <Input
                id="block-course-id"
                value={block.props.courseId}
                onChange={(e) => updateProp("courseId", e.target.value)}
                placeholder="Paste course ID to auto-populate"
              />
              <p className="text-muted-foreground text-xs">
                Enter a course ID to auto-load its module/lesson structure
              </p>
            </div>
          )}

          {/* HTML content */}
          {block.props.htmlContent !== undefined && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-html-content">HTML Content</Label>
              <Textarea
                id="block-html-content"
                value={block.props.htmlContent}
                onChange={(e) => updateProp("htmlContent", e.target.value)}
                className="min-h-[120px] font-mono text-xs"
                placeholder="<div>Your HTML here</div>"
              />
              <p className="text-muted-foreground text-xs">
                Rendered in a sandboxed iframe for safety
              </p>
            </div>
          )}

          <Separator />

          {/* Background color */}
          <div className="grid gap-1.5">
            <Label htmlFor="block-bg-color">Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="block-bg-color"
                type="color"
                value={block.props.backgroundColor ?? "#ffffff"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
                className="size-8 cursor-pointer rounded border"
                aria-label="Pick background color"
              />
              <Input
                value={block.props.backgroundColor ?? "#ffffff"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
                className="flex-1 font-mono text-xs"
                maxLength={7}
                aria-label="Background color hex value"
              />
            </div>
          </div>

          {/* Highlight index for pricing */}
          {block.props.highlightIndex !== undefined && block.props.items && (
            <div className="grid gap-1.5">
              <Label htmlFor="block-highlight-index">Highlighted Plan (0-based index)</Label>
              <Input
                id="block-highlight-index"
                type="number"
                min={-1}
                max={block.props.items.length - 1}
                value={String(block.props.highlightIndex)}
                onChange={(e) => {
                  updateProps({ highlightIndex: Number.parseInt(e.target.value, 10) });
                }}
              />
              <p className="text-muted-foreground text-xs">
                Set to -1 to disable. Highlighted plan shows a "Recommended" badge.
              </p>
            </div>
          )}

          {/* Social links for instructor */}
          {block.props.socialLinks !== undefined && (
            <div className="space-y-2">
              <Separator />
              <Label>Social Links</Label>
              {(block.props.socialLinks ?? []).map((link, index) => (
                <div key={`social-${String(index)}`} className="flex items-end gap-1.5">
                  <div className="grid flex-1 gap-1">
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...(block.props.socialLinks ?? [])];
                        updated[index] = { ...updated[index], label: e.target.value };
                        updateProps({ socialLinks: updated });
                      }}
                      placeholder="Label"
                      className="h-7 text-xs"
                      aria-label={`Social link ${String(index + 1)} label`}
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...(block.props.socialLinks ?? [])];
                        updated[index] = { ...updated[index], url: e.target.value };
                        updateProps({ socialLinks: updated });
                      }}
                      placeholder="https://..."
                      className="h-7 text-xs"
                      aria-label={`Social link ${String(index + 1)} URL`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => {
                      const updated = (block.props.socialLinks ?? []).filter((_, i) => i !== index);
                      updateProps({ socialLinks: updated });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const updated = (block.props.socialLinks ?? []).filter((_, i) => i !== index);
                        updateProps({ socialLinks: updated });
                      }
                    }}
                    aria-label={`Remove social link ${String(index + 1)}`}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1 text-xs"
                onClick={() => {
                  const updated = [...(block.props.socialLinks ?? []), { label: "", url: "" }];
                  updateProps({ socialLinks: updated });
                }}
              >
                <Plus className="size-3" />
                Add Link
              </Button>
            </div>
          )}

          {/* Items list with add/edit/remove */}
          {block.props.items !== undefined && (
            <div className="space-y-2">
              <Separator />
              <Label>Items ({block.props.items.length})</Label>
              <div className="space-y-2">
                {block.props.items.map((item, index) => (
                  <Card key={`item-${String(index)}`} className="p-0">
                    <CardContent className="space-y-1.5 p-2.5">
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...(block.props.items ?? [])];
                          updated[index] = { ...updated[index], title: e.target.value };
                          updateProps({ items: updated });
                        }}
                        className="h-7 text-xs font-medium"
                        placeholder="Title"
                        aria-label={`Item ${String(index + 1)} title`}
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...(block.props.items ?? [])];
                          updated[index] = { ...updated[index], description: e.target.value };
                          updateProps({ items: updated });
                        }}
                        className="min-h-[48px] text-xs"
                        placeholder="Description"
                        aria-label={`Item ${String(index + 1)} description`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 text-destructive text-xs hover:text-destructive"
                        onClick={() => {
                          const updated = (block.props.items ?? []).filter((_, i) => i !== index);
                          updateProps({ items: updated });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const updated = (block.props.items ?? []).filter((_, i) => i !== index);
                            updateProps({ items: updated });
                          }
                        }}
                      >
                        <Trash2 className="size-3" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1 text-xs"
                onClick={() => {
                  const updated = [...(block.props.items ?? []), { title: "New Item", description: "Description here." }];
                  updateProps({ items: updated });
                }}
              >
                <Plus className="size-3" />
                Add Item
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

// -- SEO Dialog -------------------------------------------------------------

type SeoDialogProps = {
  readonly seo: SeoSettings;
  readonly dispatch: React.ActionDispatch<[action: PageBuilderAction]>;
};

function SeoDialog({ seo, dispatch }: SeoDialogProps) {
  const [localSeo, setLocalSeo] = useState(seo);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setLocalSeo(seo);
      }
      setIsOpen(open);
    },
    [seo],
  );

  const handleSave = useCallback(() => {
    dispatch({ type: "UPDATE_SEO", payload: localSeo });
    setIsOpen(false);
  }, [dispatch, localSeo]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Globe className="size-3.5" />
          SEO
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>SEO Settings</DialogTitle>
          <DialogDescription>
            Configure search engine optimization for this landing page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="seo-meta-title">Meta Title</Label>
            <Input
              id="seo-meta-title"
              value={localSeo.metaTitle}
              onChange={(e) =>
                setLocalSeo((prev) => ({ ...prev, metaTitle: e.target.value }))
              }
              maxLength={70}
              placeholder="Page title for search engines"
            />
            <p className="text-muted-foreground text-xs">
              {`${localSeo.metaTitle.length}/70 characters`}
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="seo-meta-description">Meta Description</Label>
            <Textarea
              id="seo-meta-description"
              value={localSeo.metaDescription}
              onChange={(e) =>
                setLocalSeo((prev) => ({ ...prev, metaDescription: e.target.value }))
              }
              className="min-h-[80px]"
              maxLength={160}
              placeholder="Brief description for search results"
            />
            <p className="text-muted-foreground text-xs">
              {`${localSeo.metaDescription.length}/160 characters`}
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="seo-og-image">OG Image URL</Label>
            <Input
              id="seo-og-image"
              value={localSeo.ogImageUrl}
              onChange={(e) =>
                setLocalSeo((prev) => ({ ...prev, ogImageUrl: e.target.value }))
              }
              placeholder="https://..."
            />
            <p className="text-muted-foreground text-xs">
              Recommended: 1200x630px
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="seo-canonical">Canonical URL</Label>
            <Input
              id="seo-canonical"
              value={localSeo.canonicalUrl}
              onChange={(e) =>
                setLocalSeo((prev) => ({ ...prev, canonicalUrl: e.target.value }))
              }
              placeholder="https://yoursite.com/page"
              type="url"
            />
            <p className="text-muted-foreground text-xs">
              Leave blank to use the default page URL
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="seo-noindex" className="font-medium text-sm">
                Hide from search engines
              </Label>
              <p className="text-muted-foreground text-xs">
                Add noindex meta tag to prevent indexing
              </p>
            </div>
            <Switch
              id="seo-noindex"
              checked={localSeo.noindex}
              onCheckedChange={(checked) =>
                setLocalSeo((prev) => ({ ...prev, noindex: checked }))
              }
            />
          </div>

          <Separator />
          <div>
            <p className="font-medium text-muted-foreground text-xs">Search Preview</p>
            <div className="mt-2 rounded-lg border p-3">
              <p className="line-clamp-1 font-medium text-blue-600 text-sm">
                {localSeo.metaTitle.length > 0 ? localSeo.metaTitle : "Untitled Page"}
              </p>
              <p className="mt-0.5 text-emerald-700 text-xs">
                {localSeo.canonicalUrl || "yoursite.com/pages/..."}
              </p>
              <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                {localSeo.metaDescription.length > 0
                  ? localSeo.metaDescription
                  : "No description provided."}
              </p>
              {localSeo.noindex && (
                <p className="mt-1 font-medium text-amber-600 text-xs">
                  This page will not be indexed by search engines
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save SEO Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -- Template Selector Dialog -----------------------------------------------

type TemplateSelectorDialogProps = {
  readonly dispatch: React.ActionDispatch<[action: PageBuilderAction]>;
};

function TemplateSelectorDialog({ dispatch }: TemplateSelectorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectTemplate = useCallback(
    (template: PageTemplate) => {
      // Assign fresh unique IDs so blocks don't collide
      const blocksWithNewIds = template.blocks.map((b) => ({
        ...b,
        id: createBlockId(),
      }));
      dispatch({ type: "LOAD_TEMPLATE", payload: blocksWithNewIds });
      setIsOpen(false);
    },
    [dispatch],
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <LayoutTemplate className="size-3.5" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Page Templates</DialogTitle>
          <DialogDescription>
            Choose a template to get started quickly. This will replace your current blocks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAGE_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                type="button"
                className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent"
                onClick={() => handleSelectTemplate(template)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectTemplate(template);
                  }
                }}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{template.name}</p>
                  <p className="mt-0.5 text-muted-foreground text-xs">{template.description}</p>
                  <p className="mt-1 text-muted-foreground text-[10px]">
                    {`${template.blocks.length} blocks`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -- Preview Panel ----------------------------------------------------------

const VIEWPORT_WIDTHS: Record<PreviewViewport, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
};

type PreviewPanelProps = {
  readonly blocks: readonly Block[];
  readonly viewport: PreviewViewport;
  readonly dispatch: React.ActionDispatch<[action: PageBuilderAction]>;
};

function PreviewPanel({ blocks, viewport, dispatch }: PreviewPanelProps) {
  const viewportWidth = VIEWPORT_WIDTHS[viewport];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Viewport switcher */}
      <div className="flex items-center justify-center gap-2 border-b bg-muted/30 px-4 py-2">
        <Button
          type="button"
          variant={viewport === "mobile" ? "default" : "ghost"}
          size="sm"
          className="gap-1.5"
          onClick={() => dispatch({ type: "SET_VIEWPORT", payload: "mobile" })}
          aria-label="Mobile preview (375px)"
        >
          <Smartphone className="size-3.5" />
          Mobile
        </Button>
        <Button
          type="button"
          variant={viewport === "tablet" ? "default" : "ghost"}
          size="sm"
          className="gap-1.5"
          onClick={() => dispatch({ type: "SET_VIEWPORT", payload: "tablet" })}
          aria-label="Tablet preview (768px)"
        >
          <Tablet className="size-3.5" />
          Tablet
        </Button>
        <Button
          type="button"
          variant={viewport === "desktop" ? "default" : "ghost"}
          size="sm"
          className="gap-1.5"
          onClick={() => dispatch({ type: "SET_VIEWPORT", payload: "desktop" })}
          aria-label="Desktop preview (1280px)"
        >
          <Monitor className="size-3.5" />
          Desktop
        </Button>
      </div>

      {/* Preview container */}
      <ScrollArea className="flex-1 bg-muted/50">
        <div className="flex justify-center px-4 py-6">
          <div
            className="overflow-hidden rounded-lg border bg-white shadow-lg transition-all"
            style={{ width: `${viewportWidth}px`, maxWidth: "100%" }}
          >
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <EyeOff className="size-10 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground text-sm">No blocks to preview</p>
              </div>
            ) : (
              blocks.map((block) => (
                <BlockPreview key={block.id} block={block} />
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// -- Main Page Component ----------------------------------------------------

function PageBuilderPage() {
  const { id } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(pageBuilderReducer, INITIAL_STATE);
  const [hasLoadedServer, setHasLoadedServer] = useState(false);

  const pageQuery = useQuery(
    trpc.landingPages.getById.queryOptions({ id }),
  );

  // Load server data into reducer once
  useEffect(() => {
    if (pageQuery.data && !hasLoadedServer) {
      const page = pageQuery.data;
      const serverBlocks = Array.isArray(page.pageJson)
        ? (page.pageJson as Block[])
        : [];
      dispatch({
        type: "LOAD_PAGE",
        payload: {
          title: page.title,
          blocks: serverBlocks,
          seo: {
            metaTitle: page.metaTitle ?? "",
            metaDescription: page.metaDescription ?? "",
            ogImageUrl: page.ogImageUrl ?? "",
            canonicalUrl: page.canonicalUrl ?? "",
            noindex: page.noindex ?? false,
          },
        },
      });
      setHasLoadedServer(true);
    }
  }, [pageQuery.data, hasLoadedServer]);

  const updateMutation = useMutation(
    trpc.landingPages.update.mutationOptions({
      onSuccess: () => {
        toast.success("Page saved");
        dispatch({ type: "MARK_SAVED" });
        queryClient.invalidateQueries({
          queryKey: trpc.landingPages.getById.queryKey({ id }),
        });
      },
      onError: () => {
        toast.error("Failed to save page");
      },
    }),
  );

  const selectedBlock = state.blocks.find((b) => b.id === state.selectedBlockId);

  const handleAddBlock = useCallback(
    (blockType: BlockType) => {
      dispatch({ type: "ADD_BLOCK", payload: { blockType } });
    },
    [],
  );

  const handleSaveDraft = useCallback(() => {
    updateMutation.mutate({
      id,
      title: state.pageTitle,
      pageJson: state.blocks.map((b) => ({ id: b.id, type: b.type, props: { ...b.props } })),
      metaTitle: state.seo.metaTitle,
      metaDescription: state.seo.metaDescription,
      ogImageUrl: state.seo.ogImageUrl,
      canonicalUrl: state.seo.canonicalUrl || undefined,
      noindex: state.seo.noindex,
    });
  }, [updateMutation, id, state.pageTitle, state.blocks, state.seo]);

  const handlePublish = useCallback(() => {
    updateMutation.mutate({
      id,
      title: state.pageTitle,
      pageJson: state.blocks.map((b) => ({ id: b.id, type: b.type, props: { ...b.props } })),
      metaTitle: state.seo.metaTitle,
      metaDescription: state.seo.metaDescription,
      ogImageUrl: state.seo.ogImageUrl,
      canonicalUrl: state.seo.canonicalUrl || undefined,
      noindex: state.seo.noindex,
      status: "published",
    });
  }, [updateMutation, id, state.pageTitle, state.blocks, state.seo]);

  if (pageQuery.isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading page builder...</p>
        </div>
      </div>
    );
  }

  if (pageQuery.isError) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="font-medium text-destructive">Failed to load page</p>
          <p className="mt-1 text-muted-foreground text-sm">The page may not exist or you do not have access.</p>
          <Button type="button" variant="outline" size="sm" className="mt-4" asChild>
            <Link to="/dashboard/pages">Back to Pages</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="-my-6 -mx-4 sm:-mx-6 lg:-mx-8 flex h-[calc(100vh-8rem)] flex-col">
      {/* Top toolbar */}
      <header className="flex items-center gap-3 border-b bg-background px-4 py-2">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/dashboard/pages" aria-label="Back to pages list">
            <ArrowLeft className="size-4" />
            Pages
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />

        {/* Page title */}
        <div className="min-w-0 flex-1">
          <Input
            value={state.pageTitle}
            onChange={(e) =>
              dispatch({ type: "SET_TITLE", payload: e.target.value })
            }
            className="h-8 max-w-xs border-transparent bg-transparent font-semibold text-sm hover:border-input focus:border-input"
            maxLength={200}
            aria-label="Page title"
          />
        </div>

        {state.isDirty && (
          <Badge variant="outline" className="text-xs">
            Unsaved
          </Badge>
        )}

        <div className="flex items-center gap-2">
          <TemplateSelectorDialog dispatch={dispatch} />
          <SeoDialog seo={state.seo} dispatch={dispatch} />
          <Button
            type="button"
            variant={state.isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
          >
            {state.isPreviewMode ? (
              <>
                <Pencil className="size-3.5" />
                Edit
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                Preview
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={updateMutation.isPending || !state.isDirty}
          >
            <Save className="size-3.5" />
            {updateMutation.isPending ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={updateMutation.isPending}
          >
            <Globe className="size-3.5" />
            Publish
          </Button>
        </div>
      </header>

      {/* Main content: editor or preview */}
      {state.isPreviewMode ? (
        <PreviewPanel
          blocks={state.blocks}
          viewport={state.previewViewport}
          dispatch={dispatch}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <BlockPalettePanel onAddBlock={handleAddBlock} />
          <CanvasPanel
            blocks={state.blocks}
            selectedBlockId={state.selectedBlockId}
            dispatch={dispatch}
          />
          <BlockSettingsPanel block={selectedBlock} dispatch={dispatch} />
        </div>
      )}
    </div>
  );
}
