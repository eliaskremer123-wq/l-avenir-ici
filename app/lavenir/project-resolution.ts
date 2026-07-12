import type { Project, Recommendation } from "./types";

export function resolveRecommendationProject(
  recommendation: Recommendation,
  apiProjects: Project[],
  staticProjects: Project[],
): Project | undefined {
  const { stableProjectKey, projectId } = recommendation;
  const apiByKey = apiProjects.find(
    (p) => p.stableProjectKey === stableProjectKey,
  );

  if (projectId) {
    const apiById = apiProjects.find((p) => p.id === projectId);
    if (apiById) {
      return apiById;
    }
  }

  if (apiByKey) {
    return apiByKey;
  }

  if (projectId) {
    const staticById = staticProjects.find((p) => p.id === projectId);
    if (staticById) {
      warnStaticFallbackWhenApiExists(recommendation, apiByKey, staticById);
      return staticById;
    }
  }

  const staticByKey = staticProjects.find(
    (p) => p.stableProjectKey === stableProjectKey,
  );
  if (staticByKey) {
    warnStaticFallbackWhenApiExists(recommendation, apiByKey, staticByKey);
    return staticByKey;
  }

  return undefined;
}

function warnStaticFallbackWhenApiExists(
  recommendation: Recommendation,
  apiProject: Project | undefined,
  staticProject: Project,
) {
  if (!apiProject) return;

  console.warn(
    "[project-resolution] Recommendation resolved to static PROJECTS fallback, but an API project with the same stableProjectKey exists.",
    {
      stableProjectKey: recommendation.stableProjectKey,
      recommendationProjectId: recommendation.projectId,
      apiProjectId: apiProject.id,
      staticProjectId: staticProject.id,
      apiTargetYear: apiProject.targetYear,
      staticTargetYear: staticProject.targetYear,
    },
  );
}
