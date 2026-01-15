<template>
    <div>Setting Page</div>
</template>

<script setup>
    definePageMeta({
        layout: 'dashboard',
        roles: ['superadmin'],
        middleware: 'auth'
    })
</script>