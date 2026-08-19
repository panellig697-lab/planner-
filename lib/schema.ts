// Pure data — no server-only imports — safe to use from both client and server code.

export type EntityType =
  | "people"
  | "companies"
  | "projects"
  | "tasks"
  | "ideas"
  | "knowledge"
  | "events"
  | "creative";

export type FieldType =
  | "title"
  | "text"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "relation"
  | "checkbox";

export interface FieldDef {
  key: string; // flat JSON key used in /api/state and /api/mutate
  notionProp: string; // exact Notion property name
  type: FieldType;
  label: string;
  options?: string[]; // for select
  relation?: EntityType; // target entity for relation fields
  currency?: boolean; // number field formatted as £
}

export interface EntitySchema {
  type: EntityType;
  label: string;
  singular: string;
  dataSourceId: string;
  titleField: string; // flat key of the title field
  fields: FieldDef[];
}

export const SCHEMAS: Record<EntityType, EntitySchema> = {
  people: {
    type: "people",
    label: "People",
    singular: "Person",
    dataSourceId: "5b3acef8-4998-45c8-a86b-6b280c8663b1",
    titleField: "name",
    fields: [
      { key: "name", notionProp: "Name", type: "title", label: "Name" },
      { key: "role", notionProp: "Role", type: "text", label: "Role" },
      { key: "email", notionProp: "Email", type: "email", label: "Email" },
      { key: "phone", notionProp: "Phone", type: "phone", label: "Phone" },
      {
        key: "relationship",
        notionProp: "Relationship",
        type: "select",
        label: "Relationship",
        options: ["Client", "Partner", "Collaborator", "Lead", "Contact", "Parked"],
      },
      { key: "notes", notionProp: "Notes", type: "text", label: "Notes" },
      { key: "last_contacted", notionProp: "Last Contacted", type: "date", label: "Last Contacted" },
      { key: "next_follow_up", notionProp: "Next Follow-up", type: "date", label: "Next Follow-up" },
      { key: "company_id", notionProp: "Company", type: "relation", label: "Company", relation: "companies" },
    ],
  },
  companies: {
    type: "companies",
    label: "Companies",
    singular: "Company",
    dataSourceId: "d70ddbcd-2f76-49a0-b40b-f24845a9491a",
    titleField: "name",
    fields: [
      { key: "name", notionProp: "Name", type: "title", label: "Name" },
      { key: "industry", notionProp: "Industry", type: "select", label: "Industry" },
      { key: "website", notionProp: "Website", type: "url", label: "Website" },
      { key: "opportunity", notionProp: "Opportunity", type: "text", label: "Opportunity" },
      { key: "problems_identified", notionProp: "Problems Identified", type: "text", label: "Problems Identified" },
      { key: "solutions_offered", notionProp: "Solutions Offered", type: "text", label: "Solutions Offered" },
      {
        key: "pipeline_stage",
        notionProp: "Pipeline Stage",
        type: "select",
        label: "Pipeline Stage",
        options: ["New", "Contacted", "In Talks", "Converted"],
      },
      { key: "deal_value", notionProp: "Deal Value", type: "number", label: "Deal Value", currency: true },
      { key: "revenue_note", notionProp: "Revenue Note", type: "text", label: "Revenue Note" },
      { key: "source", notionProp: "Source", type: "select", label: "Source" },
      { key: "last_contacted", notionProp: "Last Contacted", type: "date", label: "Last Contacted" },
      {
        key: "area",
        notionProp: "Area",
        type: "select",
        label: "Area",
        options: ["Clario", "Retainr", "Art", "Photography", "Music", "Connections", "General"],
      },
    ],
  },
  projects: {
    type: "projects",
    label: "Projects",
    singular: "Project",
    dataSourceId: "5d4379ce-e459-46a6-80c2-cfd66ef5c164",
    titleField: "name",
    fields: [
      { key: "name", notionProp: "Name", type: "title", label: "Name" },
      { key: "purpose", notionProp: "Purpose", type: "text", label: "Purpose" },
      {
        key: "status",
        notionProp: "Status",
        type: "select",
        label: "Status",
        options: ["Active", "Waiting", "Queued", "Done"],
      },
      {
        key: "area",
        notionProp: "Area",
        type: "select",
        label: "Area",
        options: ["Clario", "Retainr", "Art", "Photography", "Music", "Connections", "General"],
      },
      { key: "client_person_id", notionProp: "Client Person", type: "relation", label: "Client Person", relation: "people" },
      { key: "client_company_id", notionProp: "Client Company", type: "relation", label: "Client Company", relation: "companies" },
      { key: "revenue_potential", notionProp: "Revenue Potential", type: "number", label: "Revenue Potential", currency: true },
      { key: "target_date", notionProp: "Target Date", type: "date", label: "Target Date" },
      { key: "notes", notionProp: "Notes", type: "text", label: "Notes" },
    ],
  },
  tasks: {
    type: "tasks",
    label: "Tasks",
    singular: "Task",
    dataSourceId: "c43b81b1-1031-4637-8a94-6e698702dca9",
    titleField: "task",
    fields: [
      { key: "task", notionProp: "Task", type: "title", label: "Task" },
      { key: "priority", notionProp: "Priority", type: "select", label: "Priority", options: ["High", "Medium", "Low"] },
      { key: "deadline", notionProp: "Deadline", type: "date", label: "Deadline" },
      { key: "status", notionProp: "Status", type: "select", label: "Status", options: ["Todo", "In Progress", "Done"] },
      { key: "next_action", notionProp: "Next Action", type: "text", label: "Next Action" },
      { key: "project_id", notionProp: "Project", type: "relation", label: "Project", relation: "projects" },
      { key: "person_id", notionProp: "Person", type: "relation", label: "Person", relation: "people" },
      { key: "company_id", notionProp: "Company", type: "relation", label: "Company", relation: "companies" },
    ],
  },
  ideas: {
    type: "ideas",
    label: "Ideas",
    singular: "Idea",
    dataSourceId: "b6667de6-c7c5-4e74-91d7-091cec174a6a",
    titleField: "idea",
    fields: [
      { key: "idea", notionProp: "Idea", type: "title", label: "Idea" },
      {
        key: "category",
        notionProp: "Category",
        type: "select",
        label: "Category",
        options: ["Product", "Content", "Business", "Creative", "Other"],
      },
      { key: "description", notionProp: "Description", type: "text", label: "Description" },
      { key: "potential_value", notionProp: "Potential Value", type: "select", label: "Potential Value", options: ["High", "Medium", "Low"] },
      { key: "status", notionProp: "Status", type: "select", label: "Status", options: ["Raw", "Exploring", "Validated", "Parked"] },
      { key: "related_project_ids", notionProp: "Related Projects", type: "relation", label: "Related Projects", relation: "projects" },
    ],
  },
  knowledge: {
    type: "knowledge",
    label: "Knowledge",
    singular: "Knowledge",
    dataSourceId: "5ec017d0-319a-46de-9656-d5bbc1268f68",
    titleField: "title",
    fields: [
      { key: "title", notionProp: "Title", type: "title", label: "Title" },
      {
        key: "category",
        notionProp: "Category",
        type: "select",
        label: "Category",
        options: ["AI Research", "Business", "Marketing", "Photography", "Art", "Prompts"],
      },
      { key: "source", notionProp: "Source", type: "url", label: "Source" },
      { key: "summary", notionProp: "Summary", type: "text", label: "Summary" },
      { key: "tags", notionProp: "Tags", type: "multiselect", label: "Tags" },
      { key: "related_project_ids", notionProp: "Related Projects", type: "relation", label: "Related Projects", relation: "projects" },
    ],
  },
  events: {
    type: "events",
    label: "Events",
    singular: "Event",
    dataSourceId: "38d93ce8-5cea-4bb3-96a8-fe72e5bf61e5",
    titleField: "title",
    fields: [
      { key: "title", notionProp: "Title", type: "title", label: "Title" },
      { key: "date", notionProp: "Date", type: "date", label: "Date" },
      {
        key: "type",
        notionProp: "Type",
        type: "select",
        label: "Type",
        options: ["Meeting", "Call", "Follow-up", "Deadline", "Personal"],
      },
      { key: "notes", notionProp: "Notes", type: "text", label: "Notes" },
      { key: "related_project_id", notionProp: "Related Project", type: "relation", label: "Related Project", relation: "projects" },
    ],
  },
  creative: {
    type: "creative",
    label: "Creative",
    singular: "Creative Work",
    dataSourceId: "07f2b8e8-0662-4b94-85cf-5185ea60101d",
    titleField: "name",
    fields: [
      { key: "name", notionProp: "Name", type: "title", label: "Name" },
      {
        key: "discipline",
        notionProp: "Discipline",
        type: "select",
        label: "Discipline",
        options: ["Photography", "Videography", "Art", "Music", "Other"],
      },
      {
        key: "status",
        notionProp: "Status",
        type: "select",
        label: "Status",
        options: ["Idea", "Active", "Completed", "Archived"],
      },
      {
        key: "category",
        notionProp: "Category",
        type: "select",
        label: "Portfolio Category",
        options: ["Portraits", "Street", "Documentary", "Commercial", "Art", "Music/Design", "Video", "Other"],
      },
      { key: "featured", notionProp: "Featured", type: "checkbox", label: "Featured in Portfolio" },
      { key: "description", notionProp: "Description", type: "text", label: "Description" },
      { key: "url", notionProp: "URL", type: "url", label: "URL" },
      { key: "related_project_ids", notionProp: "Related Project", type: "relation", label: "Related Project", relation: "projects" },
    ],
  },
};

export const ENTITY_TYPES = Object.keys(SCHEMAS) as EntityType[];

// The shared "Area" tag on companies/projects — the mechanism Retainr,
// Clario, and (previously) creative work were segmented by before Creative
// got its own dedicated database. Kept here as the single source of truth
// for what counts as "this business" when merging area-tagged records with
// records directly related to a business's company row.
export const AREA_OPTIONS = SCHEMAS.companies.fields.find((f) => f.key === "area")!.options!;
