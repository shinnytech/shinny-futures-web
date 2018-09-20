import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        user: {},
        session_id: null,
        index_label: null
    },
    mutations: {
        doLogin(state, session_id) {
               state.session_id = session_id
        },
        setIndexLable(state, index_label) {
            state.index_label = index_label
        },
        setshowStcok_status(state, showStcok_status) {
            state.showStcok_status = showStcok_status
        },
    }
})