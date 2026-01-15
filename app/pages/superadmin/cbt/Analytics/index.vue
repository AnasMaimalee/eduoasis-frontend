<template>
    <div>Analytics Page</div>
</template>

<script setup>
    definePageMeta({
        layout: 'dashboard',
        roles: ['superadmin'],
        middleware: 'auth'
    })
</script>