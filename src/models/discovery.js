/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {message} from "antd";
import {
  addProxySelector,
  deleteProxySelector,
  fetchProxySelector,  getDiscoveryTypeEnums,
  postDiscoveryInsertOrUpdate,
  updateProxySelector,
  getDiscovery

} from "../services/api";
import {getIntlContent} from "../utils/IntlUtils";

export default {
  namespace: "discovery",

  state: {
    typeEnums: [],
    selectorList: [],
    chosenType: '',
    total: 0,
    currentPage: 1,
    pageSize: 4
  },

  effects: {
    * fetchSelector(params, {call, put}) {
      const {payload, callback} = params;
      const json = yield call(fetchProxySelector, payload);
      if (json.code === 200) {
        const {page, dataList} = json.data;
        if (callback) {
          callback(dataList, page.totalCount);
        }
        yield put({
          type: "saveProxySelectors",
          payload: {total: page.totalCount, dataList}
        });
      }
    },

    * fetchEnumType(params, {call, put}) {
      const {payload} = params;
      const json = yield call(getDiscoveryTypeEnums, payload);
      if (json.code === 200) {
        const data = json.data;
        yield put({
          type: "saveEnumTypes",
          payload: {data}
        });
      }
    },

    * add(params, {call, put}) {
      const {payload, callback, fetchValue} = params;
      const json = yield call(addProxySelector, payload);
      if (json.code === 200) {
        message.success(getIntlContent('SHENYU.COMMON.RESPONSE.ADD.SUCCESS'));
        callback();
        yield put({
          type: "reload", fetchValue
        })
      } else {
        message.warn(json.message);
      }
    },
    * delete(params, {call, put}) {
      const {payload, fetchValue} = params;
      const { list } = payload;
      const json = yield call(deleteProxySelector, { list });
      if (json.code === 200) {
        message.success(getIntlContent('SHENYU.COMMON.RESPONSE.DELETE.SUCCESS'));
        // callback();
        yield put({type: "reload", fetchValue});
      } else {
        message.warn(json.message);
      }
    },
    * update(params, {call, put}) {
      const {payload, callback, fetchValue} = params;
      const json = yield call(updateProxySelector, payload);
      if (json.code === 200) {
        message.success(getIntlContent('SHENYU.COMMON.RESPONSE.UPDATE.SUCCESS'));
        callback();
        yield put({type: "reload", fetchValue});
      } else {
        message.warn(json.message);
      }
    },
    * reload(params, {put}) {
      const {fetchValue} = params;
      const {name = '', currentPage, pageSize} = fetchValue;
      const payload = {name, currentPage, pageSize};
      yield put({type: "fetchSelector", payload});
    },


    * set(params, {call}) {
      const {payload, callback} = params;
      const json = yield call(postDiscoveryInsertOrUpdate, payload);
      if (json.code === 200) {
        message.success(getIntlContent('SHENYU.COMMON.RESPONSE.CONFIGURATION.SUCCESS'));
        const { data } = json;
        if (callback) {
          callback(data);
        }
      } else {
        message.warn(json.message);
      }
    },


    * fetchDiscovery(params, {call, put}) {
      const {payload, callback} = params;
      const json = yield call(getDiscovery, payload);
      if (json.code === 200) {
        const {data} = json;
        if (callback) {
          callback(data);
        }
        yield put({
          type: "saveConfig",
          payload: data
        });
      }
    },

  },

  reducers: {
    saveProxySelectors(state, {payload}) {
      return {
        ...state,
        selectorList: payload.dataList,
        total: payload.total
      };
    },

    saveEnumTypes(state, {payload}) {
      return {
        ...state,
        typeEnums: payload.data
      }
    },

    saveGlobalType(state, {payload}) {
      return {
        ...state,
        chosenType: payload.chosenType
      }
    },
    setCurrentPage(state, {payload}) {
      return {
        ...state,
        currentPage: payload.currentPage,
        pageSize: payload.pageSize
      }
    },

  }
};
