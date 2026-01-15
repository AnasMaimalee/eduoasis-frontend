<template>
    <div>Result Page</div>
</template>

<script setup>
    definePageMeta({
        layout: 'dashboard',
        roles: ['user'],
        middleware: 'auth'
    })
</script>