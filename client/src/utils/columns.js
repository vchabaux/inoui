import { formatDateShort, getDateDiff } from "@/utils/time";
import { computed } from "vue";
import { useStore } from "@/stores";

const settingsStore = useStore("settings");
const app = computed(() => settingsStore.project);

function formatExpiration(value) {
  if (!value) return "-";

  const expiration = getDateDiff(value, new Date());

  if (expiration < 0) return "expired";
  else return formatDateShort(value);
}

const columnsContent =
  app.value === "cnrs1"
    ? [
        {
          displayName: "Name",
          key: "slug",
          sortable: false,
          display: true,
          format: (value) => value.slice(0, 1).toUpperCase() + value.slice(1) === 'Intro' ? 'Bande annonce' : value.slice(0, 1).toUpperCase() + value.slice(1),
        },
      ]
    : [
        {
          displayName: "Name",
          key: "slug",
          sortable: false,
          display: true,
          format: (value) => value.slice(0, 1).toUpperCase() + value.slice(1),
        },
        {
          displayName: "Type",
          key: "type",
          sortable: false,
          display: true,
        },
      ];

const columnsMusicians = [
  {
    displayName: "Name",
    key: "name",
    sortable: true,
    display: true,
  },
  {
    displayName: "Created",
    key: "createdAt",
    sortable: true,
    display: true,
    format: (v) => new Date(v).toLocaleDateString(),
  },
  {
    displayName: "Updated",
    key: "updatedAt",
    sortable: true,
    display: true,
    format: (v) => new Date(v).toLocaleDateString(),
  },
];

const columnsNotices = [
  {
    displayName: "Title",
    key: "title",
    sortable: true,
    display: true,
    format: (value, item) => {
      return item.original ? `${value} (copy)` : value;
    },
  },
  {
    displayName: "Created",
    key: "createdAt",
    sortable: true,
    display: true,
    format: (value) => formatDateShort(value),
  },
  {
    displayName: "Last updated",
    key: "updatedAt",
    sortable: true,
    display: true,
    format: (value) => formatDateShort(value),
  },
];

const columnsPlaylists = [
  {
    displayName: "Name",
    key: "name",
    sortable: true,
    display: true,
  },
  {
    displayName: "Created",
    key: "createdAt",
    sortable: true,
    display: true,
    format: (v) => new Date(v).toLocaleDateString(),
  },
  {
    displayName: "Updated",
    key: "updatedAt",
    sortable: true,
    display: true,
    format: (v) => new Date(v).toLocaleDateString(),
  },
];

const columnsTracks = [
  {
    displayName: "Name",
    key: "name",
    sortable: true,
    display: true,
  },
  {
    displayName: "Author",
    key: "attributes.author",
    sortable: true,
    display: true,
    format: (v) => v?.email,
  },
  {
    displayName: "Created",
    key: "createdAt",
    sortable: true,
    display: true,
    format: (value) => formatDateShort(value),
  },
  {
    displayName: "Last updated",
    key: "updatedAt",
    sortable: true,
    display: true,
    format: (value) => formatDateShort(value),
  },
];

const columnsUsers = [
  {
    displayName: "Email",
    key: "email",
    sortable: true,
    display: true,
  },
  {
    displayName: "Role",
    key: "role",
    sortable: true,
    display: true,
  },
  {
    displayName: "Expiration",
    key: "expiresAt",
    sortable: true,
    display: true,
    format: formatExpiration,
  },
  {
    displayName: "Status",
    key: "verified",
    sortable: true,
    display: true,
    format: (verified) => (verified ? "verified" : "pending"),
  },
];

const columnsNakala = [
  {
    displayName: "Name",
    key: "name",
    display: true,
    sortable: false,
  },
  {
    displayName: "Status",
    key: "status",
    display: true,
    sortable: false,
  },
  {
    displayName: "Identifier",
    key: "identifier",
    display: true,
    sortable: false,
  },
];

export { columnsContent, columnsMusicians, columnsNotices, columnsPlaylists, columnsTracks, columnsUsers, columnsNakala };
