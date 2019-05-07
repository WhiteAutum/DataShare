angular.module("dataReceived", [])
  .controller("dataReceived", function ($scope) {
   $scope.requesters = [];

    /**
     * 页面加载
     */
    $scope.$watch('$viewContentLoaded', function () {
      $scope.getProvideData($scope.selectedAccount.address);
      if (!$scope.selectedData) {
        return;
      }
      $scope.getDataRequestList($scope.selectedData.dataName);
    });

    /**
     * 查询对应账户所提供的数据列表
     */
    $scope.RequesterGetDap = function (address,dataName,password,provider) {

      if (!address || !password || !dataName || !provider )
      {
        alert("请填写完善信息！");
        return;
      }

      //解锁
      if (!unlockEtherAccount(provider, password)) {
        return;
      }

      // 为请求者 接收 数据访问地址
      try{
       // 这里可以后期加入 过期时间
        //data.dataName = web3.toAscii(contractInstance.getRequestDataNameByIndex.call(requester, i));
     var res =   web3.toAscii(contractInstance.MainRequesterGetDap.call(formatBytes(dataName), address));
     var final = trim(res);

        //   , {
        //   from: provider,
        //   gas: 80000000
        // });
        $scope.path = '';
        $scope.dap = final ;
      } catch (err) {
        console.log(err);
       alert("权能创建失败!");

      }


    };


    // function trim(str) {
    //
    //   return str.replace(/(^\s*)|(\s*$)/g, "");
    // }


    function trim(str){ //删除左右两端的空格
      return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    function ltrim(str){ //删除左边的空格
      return str.replace(/(^\s*)/g,"");
    }
    function rtrim(str){ //删除右边的空格
      return str.replace(/(\s*$)/g,"");
    }


      /**
     * 查询对应数据的提供者列表
     */
    $scope.getDataRequestList = function (dataName) {
      if (!dataName) return;
      $scope.requestList = getRequestListByDataName(dataName);
    };

    /**
     * 确认数据请求
     */
    $scope.confirmData = function (provider, password, dataName, requester) {
      if (!provider || !password || !dataName || !requester) {
        alert("请输入密码！");
        return;
      }
      if (isDataAudited(dataName, requester)) {
        alert("该数据已经被审核！");
        return;
      }
      if (confirmData(provider, password, dataName, requester)) {
        alert("确认数据请求成功！");
        return;
      }
      alert("确认数据请求失败！");
    };

    /**
     * 拒绝数据请求
     */
    $scope.rejectData = function (provider, password, dataName, requester) {
      if (!provider || !password || !dataName || !requester) {
        alert("请输入密码！");
        return;
      }
      if (isDataAudited(dataName, requester)) {
        alert("该数据已经被审核！");
        return;
      }
      if (rejectData(provider, password, dataName, requester)) {
        alert("拒绝数据请求成功！");
        return;
      }
      alert("拒绝数据请求失败！");
    };
  });

/**
 * 确认数据
 * @param provider
 * @param password
 * @param dataName
 * @param requester
 * @returns {boolean}
 */
function confirmData(provider, password, dataName, requester) {
  if (!provider || !password || !dataName || !requester) {
    return false;
  }
  if (!isDataNameExist(dataName)) {
    return false;
  }
  if (isDataAudited(dataName, requester)) {
    return false;
  }
  //判断是否是数据提供者
  var data = searchDataByName(dataName);

  if (data.provider != getUserNameByAddress(provider)) {
    return false;
  }
  if (!unlockEtherAccount(provider, password)) {
    return false;
  }
  //调用函数确认数据请求
  try {
    contractInstance.confirmData(dataName, requester, {
      from: provider,
      gas: 80000000
    });
  }
  catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

/**
 * 拒绝数据
 * @param provider
 * @param password
 * @param dataName
 * @param requester
 * @returns {boolean}
 */
function rejectData(provider, password, dataName, requester) {
  if (!provider || !password || !dataName || !requester) {
    return false;
  }
  if (!isDataNameExist(dataName)) {
    return false;
  }
  if (isDataAudited(dataName, requester)) {
    return false;
  }
  //判断是否是数据提供者
  var data = searchDataByName(dataName);
  if (data.provider != getUserNameByAddress(provider)) {
    return false;
  }
  if (!unlockEtherAccount(provider, password)) {
    return false;
  }
  //调用函数确认数据请求
  try {
    contractInstance.rejectData(dataName, requester, {
      from: provider,
      gas: 80000000
    });
  }
  catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

/**
 * 根据数据名称获取请求列表
 * @param dataName
 * @returns {Array}
 */
function getRequestListByDataName(dataName) {
  var requestList = [];
  if (!dataName || !isDataNameExist(dataName)) {
    alert("数据不存在！");
    return [];
  }
  try {
    //获取权限对象
    var accessContractInstance = accessContract.at(contractInstance.getDataAccessByName.call(dataName));
    var requesterNum = accessContractInstance.requesterNum.call().toNumber();
    for (var i = 0; i < requesterNum; i++) {
      var request = getRequestDataByName(dataName, accessContractInstance.requesterList(i));
      requestList.push(request);
    }
  } catch (err) {
    console.log(err);
    return [];
  }
  return requestList;
}
