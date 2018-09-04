import axios from "axios";
import vue from "vue";

const baseUrl = "http://127.0.0.1:8010/"

export default function (options) {
    let {
        url,
        data,
        that,
        success
    } = options;

    const loading = that.$loading({
        text: 'Loading',
        spinner: 'el-icon-loading',
    });

    return axios({
        method: 'GET',
        url: baseUrl + url,
        data,
    }).then(res => {
        loading.close()
        success(res)
    }).catch(res => {
        loading.close()
        that.$notify({
            title: '警告',
            message: '这是一条警告的提示消息',
            type: 'warning'
        });
    });
}