import { Inngest } from "inngest";
import { prisma } from "../../src/db.js";
import sendEmail from "../nodemailer/index.js";

export const inngest = new Inngest({ id: "server" });

// Inngest Function to save user data to database
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: { event: "clerk/user.created" },
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  },
);

// Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk", triggers: { event: "clerk/user.deleted" } },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  },
);

// Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: { event: "clerk/user.updated" },
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  },
);

// Inngest Funtion to save workspace data to database
const syncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-from-clerk",
    triggers: { event: "clerk/organization.created" },
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      },
    });
    // Add creator as ADMIN member
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
  },
);

// Inngest Function to update workspace data in database
const syncWorkspaceUpdation = inngest.createFunction(
  {
    id: "update-workspace-from-clerk",
    triggers: { event: "clerk/organization.updated" },
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });
  },
);

// Inngest Function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: "delete-workspace-from-clerk",
    triggers: { event: "clerk/organization.deleted" },
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: {
        id: data.id,
      },
    });
  },
);

// Inngest Function to save workspace member data to database
const syncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: "sync-workspace-member-from-clerk",
    triggers: { event: "clerk/organizationInvitation.accepted" },
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      },
    });
  },
);

// Inngest Function to send email on task creation
const sendTaskAssignmentEmail = inngest.createFunction(
  {
    id: "send-task-assignment-email",
    triggers: { event: "app/task.assigned" },
  },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        project: true,
      },
    });

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assignment in ${task.project.name}`,
      body: `Hi ${task.assignee.name}``${task.title}``${new Date(task.due_date).toLocaleDateString()} <a href=${origin}>View Task</a>`,
    });

    if (
      new Date(task.due_date).toLocaleDateString() !==
      new Date().toLocaleDateString()
    ) {
      await step.sleepUntil("wait-for-the-due-date", new Date(task.due_date));
      await step.run("check-if-task-is-completed", async () => {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true },
        });
        if (!task) return;
        if (task.status !== "DONE") {
          await step.run("send-task-reminder-email", async () => {
            await sendEmail({
              to: task.assignee.email,
              subject: `Reminder for ${task.project.name}`,
              body: ``,
            });
          });
        }
      });
    }
  },
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
  sendTaskAssignmentEmail,
];
