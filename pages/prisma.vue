<script setup lang="ts">
definePageMeta({
  middleware: ['casbin'],
});
const { data: examples } = useFetch('/api/examples')
</script>

<template>
  <div style="height: 80dvh;overflow-y: auto;">
    <div>
      Prisma ORM Data from the database, received {{ examples?.length || 0 }} records: <pre>{{ examples }}</pre>
    </div>
  </div>
</template>
