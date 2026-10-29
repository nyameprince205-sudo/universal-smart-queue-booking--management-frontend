// import apiClient from "./client";
// async function getPublicOrganization(slug) {
//   const {
//     data
//   } = await apiClient.get(`/organizations/public/${slug}`);
//   return data;
// }
// async function searchOrganizations(search) {
//   const {
//     data
//   } = await apiClient.get("/organizations/public", {
//     params: search ? {
//       search
//     } : {}
//   });
//   return data;
// }
// export { getPublicOrganization, searchOrganizations };





import apiClient from "./client";

async function getPublicOrganization(slug) {
const { data } = await apiClient.get(
`/organizations/public/${slug}`
);

return data;
}

async function searchOrganizations(search = "", options = {}) {
const params = {};

if (search?.trim()) {
params.search = search.trim();
}

if (options.categoryId !== undefined && options.categoryId !== null) {
params.categoryId = options.categoryId;
}

const { data } = await apiClient.get("/organizations/public", {
params
});

return data;
}

async function listPublicBusinessTypes() {
const { data } = await apiClient.get("/business-types/public");

return data;
}

export {
getPublicOrganization,
searchOrganizations,
listPublicBusinessTypes
};
