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

    <!--<el-dialog-->
      <!--width="80%"-->
      <!--:lock-scroll="false"-->
      <!--:append-to-body="true"-->
      <!--:close-on-click-modal="false"-->
      <!--:close-on-press-escape="false"-->
      <!--:visible="visible">-->
      <!--<span slot="footer" class="dialog-footer">-->
        <!--<el-button type="primary" @click="clickOk">确 定</el-button>-->
      <!--</span>-->
  <!--</el-dialog>-->
</template>
<script>
  import {mapGetters} from 'vuex'
  export default {
    props: {},
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
        this.$store.commit('CONFIRM_SETTLEMENT')

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
