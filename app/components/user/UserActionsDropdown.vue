<script setup lang="ts">
import { Dropdown, Menu } from 'ant-design-vue'
import { EyeOutlined, PlusCircleOutlined, MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const props = defineProps<{ user: any }>()
const emit = defineEmits<{
  (e: 'show', user: any): void
  (e: 'fund', user: any): void
  (e: 'debit', user: any): void
  (e: 'delete', id: string): void
}>()
</script>

<template>
  <Dropdown trigger="hover" placement="bottomRight">
    <Button type="link" size="small">Actions</Button>
    <template #overlay>
      <Menu>
        <Menu.Item key="show" @click="$emit('show', props.user)">
          <EyeOutlined /> View Details
        </Menu.Item>
        <Menu.Item key="fund" @click="$emit('fund', props.user)">
          <PlusCircleOutlined /> Fund Wallet
        </Menu.Item>
        <Menu.Item key="debit" @click="$emit('debit', props.user)">
          <MinusCircleOutlined /> Debit Wallet
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" danger @click="$emit('delete', props.user.id)">
          <DeleteOutlined /> Delete User
        </Menu.Item>
      </Menu>
    </template>
  </Dropdown>
</template>
