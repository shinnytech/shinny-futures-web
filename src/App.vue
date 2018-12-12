<template>
    <Layout id="shinny-app">
        <Sider class="sider" width="60">
            <!--<Tooltip content="行情服务器" placement="right">-->
                <!--<Icon type="ios-disc" size="30" :color="quoteWsConnected?'green':'red'"/>-->
            <!--</Tooltip>-->
            <!--<Tooltip content="交易服务器" placement="right">-->
                <!--<Icon type="ios-disc" size="30" :color="tradeWsConnected?'green':'red'"/>-->
            <!--</Tooltip>-->
            <Tooltip content="设置" placement="right">
                <Button type="text" size='small' to="https://www.shinnytech.com/tianqin/" target="_blank">
                    <Icon type="md-settings" size="40" />
                </Button>
            </Tooltip>

            <Tooltip content="打开天勤主页" placement="right">
                <Button type="text" size='small' to="https://www.shinnytech.com/tianqin/" target="_blank">
                    <Icon type="md-share-alt" size="40" />
                </Button>
            </Tooltip>

        </Sider>
        <Content class="content">
            <Split v-model="$root.appSplit" mode="vertical">
                <div slot="top" class="split-pane">
                    <keep-alive>
                        <router-view name="quotes"></router-view>
                    </keep-alive>
                </div>
                <div slot="trigger" class="split-horizontal">
                    <div class="split-horizontal-dots">
                        <span class="dot" ></span>
                        <span class="dot" ></span>
                        <span class="dot" ></span>
                        <span class="dot" ></span>
                        <span class="dot" ></span>
                    </div>
                </div>
                <div slot="bottom" class="split-pane">
                    <router-view name="user"></router-view>
                </div>
            </Split>
        </Content>
    </Layout>
</template>
<script>
  export default {
    data () {
      return {}
    },
    computed: {
      quoteWsConnected () {
        return this.$store.state.quoteWsConnected
      },
      tradeWsConnected () {
        return this.$store.state.tradeWsConnected
      }
    }
  }
</script>

<style lang="scss">
    html,
    body {
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
    #shinny-app {
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: absolute;

        >.sider {
            overflow-x: hidden;
            background-color: #ffffff;
            text-align: center;
            border-right: 6px solid $page-background-color;
            &::-webkit-scrollbar {
                width: 0 !important;
                height: 0 !important;
            }
        }

        >.content {
            height: 100%;
            overflow: hidden;
            background-color: #ffffff;
            &::-webkit-scrollbar {
                width: 0 !important;
                height: 0 !important;
            }
            .split-horizontal {
                width: 100%;
                height: 6px;
                background-color: $page-background-color;
                cursor: row-resize;
                .split-horizontal-dots {
                    left: 50%;
                    top: 1px;
                    width: 40px;
                    position: absolute;
                    overflow: hidden;
                    .dot {
                        background-color: darken($page-background-color, 30%);
                        height: 4px;
                        width: 4px;
                        border-radius: 2px;
                        float: left;
                        margin-right: 3px;
                    }
                }
            }

            .split-pane{
                height: 100%;
            }
        }

        // fix iview bug 水平分割块
        .ivu-split-horizontal>.ivu-split-trigger-con {
            height: 100%;
            width: 0;
        }
    }
</style>
