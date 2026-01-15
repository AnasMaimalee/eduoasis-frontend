<template>
    <div>Questions Page</div>
</template>

<script setup>
    definePageMeta({
        layout: 'dashboard',
        roles: ['superadmin'],
        middleware: 'auth'
    })
</script>