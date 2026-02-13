import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/react";
import { BuilderPage } from "@/features/builder";
import type { SDUIScreen, SDUIThemeOverrides } from "@platform/sdui-schema";

export const Route = createFileRoute("/_authed/dashboard/templates/$id/edit")({
  component: TemplateEditor,
});

function TemplateEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [deployStatus, setDeployStatus] = useState<
    "idle" | "deploying" | "success" | "error"
  >("idle");

  const { data: template, isLoading, error } = useQuery(
    trpc.sdui.templates.get.queryOptions({ id }),
  );

  const saveVersionMutation = useMutation(
    trpc.sdui.templates.saveVersion.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.sdui.templates.get.queryKey({ id }),
        });
      },
    }),
  );

  const createInstanceMutation = useMutation(
    trpc.sdui.instances.create.mutationOptions({}),
  );

  const deployMutation = useMutation(
    trpc.sdui.deployments.create.mutationOptions({
      onSuccess: () => {
        setDeployStatus("success");
        setTimeout(() => setDeployStatus("idle"), 3000);
      },
      onError: () => {
        setDeployStatus("error");
        setTimeout(() => setDeployStatus("idle"), 3000);
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">
          {error?.message ?? "Template not found"}
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard/templates" })}
          className="text-sm text-neutral-500 underline hover:text-neutral-700"
        >
          Back to templates
        </button>
      </div>
    );
  }

  // Extract the latest version's SDUI JSON
  const latestVersion = template.latestVersion;
  const initialScreen: SDUIScreen | undefined = latestVersion?.templateJson
    ? (latestVersion.templateJson as SDUIScreen)
    : undefined;

  const initialThemeOverrides: SDUIThemeOverrides | undefined =
    latestVersion?.themeJson
      ? (latestVersion.themeJson as SDUIThemeOverrides)
      : undefined;

  const handleSave = async (
    screen: SDUIScreen,
    themeOverrides?: SDUIThemeOverrides,
  ) => {
    await saveVersionMutation.mutateAsync({
      templateId: id,
      templateJson: screen as unknown as Record<string, unknown>,
      themeJson: themeOverrides as Record<string, unknown> | undefined,
    });
  };

  const handlePreview = (screen: SDUIScreen) => {
    const previewData = encodeURIComponent(JSON.stringify(screen));
    window.open(
      `/api/sdui/preview?data=${previewData}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handlePublish = async (screen: SDUIScreen) => {
    setDeployStatus("deploying");

    // 1. Save the latest version first
    await saveVersionMutation.mutateAsync({
      templateId: id,
      templateJson: screen as unknown as Record<string, unknown>,
    });

    // 2. Create (or reuse) an instance from this template
    const instance = await createInstanceMutation.mutateAsync({
      templateId: id,
      name: template.name,
    });

    // 3. Deploy the instance
    deployMutation.mutate({
      instanceId: instance.id,
      platform: "web",
    });
  };

  const handleBack = () => {
    navigate({ to: "/dashboard/templates" });
  };

  return (
    <BuilderPage
      initialScreen={initialScreen}
      screenMeta={{
        id: template.id,
        name: template.name,
        slug: template.slug,
        description: template.description ?? "",
      }}
      initialThemeOverrides={initialThemeOverrides}
      onSave={handleSave}
      onPreview={handlePreview}
      onPublish={handlePublish}
      onBack={handleBack}
    />
  );
}
