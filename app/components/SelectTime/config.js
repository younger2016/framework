const returnData = (num) => {
  const hoursArr = [];
  [...new Array(num)].map((item, index) => {
    hoursArr.push({
      name : index < 10 ? '0' + index : '' + index
    })
  })
  return hoursArr
}

 export const hoursData = returnData(24);
 export const minutesData = returnData(60);
