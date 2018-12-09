<template>
    <div class="row">
        <div>
            <div class="col" v-for="(item, index) in tags" :key="index">
                <Button size="small" :type="type(item)" @click="handlerClickTag(item)">
                    {{item}}
                </Button>
            </div>
        </div>

    </div>
</template>

<script>
export default {
  name: 'ButtonsLine',
  data () {
    return {
      selectedTag: this.defaultTag ? this.defaultTag : this.tags[0]
    }
  },
  props: {
    tags:  {
      type: Array,
      required: true,
      validator: function (value) {
        return value.length > 0
      }
    },
    defaultTag: String
  },
  methods: {
    type: function (item) {
      return item === this.selectedTag ? 'primary' : 'default'
    },
    handlerClickTag: function (item) {
      this.selectedTag = item
      this.$emit('change', item)
    }
  }
}
</script>

<style scoped lang="scss">
.row {
    height: 26px;
    width: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
    .col {
        height: 26px;
        display: inline-block;
        padding: 0px 4px;
    }
}
</style>
