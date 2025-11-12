import apiClient from "./apiClient";

export async function submitProfile(profile) {
  const { data } = await apiClient.post("/api/profiles", profile);
  return data.profile;
}

export async function generateMatchRequest({ profileId, profile, persist }) {
  const payload = {
    profileId,
    profile,
    persist: persist ?? false
  };

  const { data } = await apiClient.post("/api/match", payload);
  return data;
}

export async function downloadMatchPdf({ profile, recommendations, journey }) {
  const payload = {
    profileId: profile?.id,
    profile,
    matches: recommendations,
    journey
  };

  const { data } = await apiClient.post("/api/pdf", payload, {
    responseType: "blob"
  });

  return data;
}

