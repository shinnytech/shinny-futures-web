<template>
    <Modal
            title="确认结算单"
            v-model="visible"
            :closable="false"
            :mask-closable="false">
        <div class="confirm-container">
            <pre>{{confirmContent}}</pre>
        </div>
        <div slot="footer">
            <Button type="primary" @click="clickOk">确定</Button>
        </div>
      </Modal>
</template>
<script>
  export default {
    computed: {
      visible () {
        return this.$store.state.confirm === 'doing'
      },
      confirmContent () {
        return this.$store.state.confirmContent
      }
    },
    methods: {
      clickOk: function () {
        this.$tqsdk.confirm_settlement()
        this.$store.commit('SET_SETTLEMENT', {
          confirm: 'done',
          confirmContent: ''
        })
      }
    }
  }
</script>
<style scoped lang="scss">
    .confirm-container {
      overflow: scroll;
      height: 500px;
      border: 1px solid #ccc;
    }
</style>
