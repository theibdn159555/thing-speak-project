$(document).ready(async () => {
  // logic
  const res1 = await $.get(
    'https://api.thingspeak.com/channels/1657193/fields/1.json?results=10000',
  )

  const res2 = await $.get(
    'https://api.thingspeak.com/channels/1657193/fields/2.json?results=10000',
  )

  const res3 = await $.get(
    'https://api.thingspeak.com/channels/1657193/fields/3.json?results=10000',
  )

  const res4 = await $.get(
    'https://api.thingspeak.com/channels/1657193/fields/4.json?results=10000',
  )

  const res5 = await $.get(
    'https://api.thingspeak.com/channels/1657193/fields/5.json?results=10000',
  )

  const res6 = await $.get(
    'https://api.thingspeak.com/channels/1657193/fields/6.json?results=10000',
  )

  const listBPi = [
    { i: 1, I: 0, PM10: 0, PM25: 0 },
    { i: 2, I: 160, PM10: 50, PM25: 25 },
    { i: 3, I: 200, PM10: 150, PM25: 50 },
    { i: 4, I: 300, PM10: 250, PM25: 80 },
    { i: 5, I: 400, PM10: 350, PM25: 150 },
    { i: 6, I: 800, PM10: 420, PM25: 250 },
    { i: 7, I: 1000, PM10: 500, PM25: 350 },
  ]

  // console.log('🚀 ~ file: data.js ~ line 26 ~ $ ~ res6.feeds', res6.feeds)

  const formatDate = (feeds) => {
    feeds.map((a) => {
      var { created_at } = a
      created_at = created_at.replace(/[A-Z]/g, ` `)
      date = new Date(created_at)
      var newDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
      )

      var day = created_at.substring(8, 10)
      var month = created_at.substring(5, 7)
      var year = created_at.substring(0, 4)

      var hour = newDate.getHours().toString()
      var minute =
        newDate.getMinutes().toString().length < 2
          ? '0' + newDate.getMinutes()
          : newDate.getMinutes()

      a.created_at = `${day}-${month}-${year} ${hour}:${minute}`
      a.day = Number(day)
      a.hour = Number(hour)

      delete a['entry_id']

      return a
    })
  }

  const fixNullFirstRecord = (feeds) => {
    if (feeds[0].field1 === null || feeds[0].field1 === '')
      return (feeds[0].field1 = '0')
    if (feeds[0].field2 === null || feeds[0].field2 === '')
      return (feeds[0].field2 = '0')
    if (feeds[0].field3 === null || feeds[0].field3 === '')
      return (feeds[0].field3 = '0')
    if (feeds[0].field4 === null || feeds[0].field4 === '')
      return (feeds[0].field4 = '0')

    if (feeds[0].field5 === null || feeds[0].field5 === '')
      return (feeds[0].field5 = 'nan')

    if (feeds[0].field6 === null || feeds[0].field6 === '')
      return (feeds[0].field6 = 'nan')
  }

  const fillFields = (feeds) => {
    // alert(1)
    for (let i = 0; i < feeds.length; i++) {
      if (i === 0) continue
      if (feeds[i].field1 === null || feeds[i].field1 === '')
        feeds[i].field1 = feeds[i - 1].field1
      if (feeds[i].field2 === null || feeds[i].field2 === '')
        feeds[i].field2 = feeds[i - 1].field2
      if (feeds[i].field3 === null || feeds[i].field3 === '')
        feeds[i].field3 = feeds[i - 1].field3
      if (feeds[i].field4 === null || feeds[i].field4 === '')
        feeds[i].field4 = feeds[i - 1].field4
      if (feeds[i].field5 === null || feeds[i].field5 === '')
        feeds[i].field5 = feeds[i - 1].field5
      if (feeds[i].field6 === null || feeds[i].field6 === '')
        feeds[i].field6 = feeds[i - 1].field6
    }
  }

  const removeSameJson = (feeds) => {
    const jsonObject = feeds.map(JSON.stringify)
    const uniqueSet = new Set(jsonObject)
    return Array.from(uniqueSet).map(JSON.parse)
  }

  const sortDateByAsc = (feeds) => {
    feeds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return feeds
  }

  const consistentJson = (feeds) => {
    var temp = []
    for (let i = 0; i < feeds.length; i++) {
      const filterByDate = feeds.filter(
        (e) => e.created_at === feeds[i].created_at,
      )

      var a = []
      for (let j = 0; j < filterByDate.length; j++) {
        if (j === 0) {
          a.push(filterByDate[j])
          continue
        }

        if (
          Object.keys(filterByDate[j])[1] ===
          Object.keys(filterByDate[j - 1])[1]
        ) {
          filterByDate[j - 1][`${Object.keys(filterByDate[j - 1])[1]}`] =
            filterByDate[j][`${Object.keys(filterByDate[j])[1]}`]

          continue
        }

        a.push(filterByDate[j])
      }

      if (a.length > 0) {
        if (a[1]) {
          a[0][`${Object.keys(a[1])[1]}`] = a[1][`${Object.keys(a[1])[1]}`]
        }

        if (a[2]) {
          a[0][`${Object.keys(a[2])[1]}`] = a[2][`${Object.keys(a[2])[1]}`]
        }

        if (a[3]) {
          a[0][`${Object.keys(a[3])[1]}`] = a[3][`${Object.keys(a[3])[1]}`]
        }

        if (a[4]) {
          a[0][`${Object.keys(a[4])[1]}`] = a[4][`${Object.keys(a[4])[1]}`]
        }

        if (a[5]) {
          a[0][`${Object.keys(a[5])[1]}`] = a[5][`${Object.keys(a[5])[1]}`]
        }
      }

      if (a[0]) temp.push(a[0])
    }

    // console.log('🚀 ~ file: data.js ~ line 90 ~ consistentJson ~ temp', temp)
    return temp
  }

  const trimJson = (feeds) => {
    const a = feeds
      .filter((x) => x.field1 !== '0')
      .filter((x) => x.field2 !== '0')
      .filter((x) => x.field3 !== '0')
      .filter((x) => x.field4 !== '0')
      .filter((x) => x.field5 !== 'nan')
      .filter((x) => x.field6 !== 'nan')

    return a
  }

  // PM25_
  const PM25_findIndexPerHour = (feeds) => {
    let i
    let max = feeds[0]
    const maxList = [max]

    for (i = 1; i < feeds.length; i++) {
      if (feeds[i].day !== feeds[i - 1].day) {
        max = feeds[i]
        maxList.push(max)
        continue
      }
      if (feeds[i].hour !== feeds[i - 1].hour) {
        max = feeds[i]
        maxList.push(max)
        continue
      }

      if (Number(feeds[i].field1) > Number(max.field1)) {
        max = feeds[i]
        maxList[maxList.length - 1] = max

        continue
      }
    }
    console.log(
      '🚀 ~ file: data.js ~ line 265 ~ findIndexPerHour ~ max',
      maxList,
    )

    return maxList
  }

  const PM25_W_calc = (feeds) => {
    const listC = feeds.map((x) => Number(x.field1))
    const Cmin = Math.min(...listC)
    const Cmax = Math.max(...listC)

    return Cmin / Cmax
  }

  const PM25_w_calc = (W) => {
    if (W <= 0.5) return 0.5

    return W
  }

  const PM25_Nowcast_calc = (feeds, w) => {
    var Nowcast = 0
    // var arr = [1, 2, 3]
    if (w === 0.5) {
      for (let i = 0; i < feeds.length; i++) {
        Nowcast += Math.pow(0.5, i + 1) * Number(feeds[i].field1)
      }
    }
    if (w > 0.5) {
      numerator = 0
      denominator = 0

      for (let i = 0; i < feeds.length; i++) {
        numerator += Math.pow(w, i) * Number(feeds[i].field1)
        denominator += Math.pow(w, i)
      }

      Nowcast = numerator / denominator
    }

    // if (w === 0.5) {
    //   numerator = 0
    //   denominator = 0

    //   for (let i = 0; i < arr.length; i++) {
    //     numerator += Math.pow(w, i) * Number(arr[i])
    //     denominator += Math.pow(w, i)
    //   }

    //   Nowcast = numerator / denominator
    // }

    return Nowcast
  }

  const PM25_indexBPi_calc = (Nowcast) => {
    let i
    for (i = 0; i < listBPi.length; i++) {
      if (Nowcast < listBPi[i].PM25) {
        break
      }
    }
    return i - 1
  }

  const PM25_AQI_calc = (Nowcast, i) => {
    console.log('🚀 ~ file: data.js ~ line 275 ~ $ ~ i', i)
    const BPi = listBPi[i].PM25
    console.log('🚀 ~ file: data.js ~ line 276 ~ $ ~ BPi', BPi)
    const Ii = listBPi[i].I
    console.log('🚀 ~ file: data.js ~ line 278 ~ $ ~ Ii', Ii)

    const BPi_1 = listBPi[i + 1].PM25
    console.log('🚀 ~ file: data.js ~ line 281 ~ $ ~ BPi_1', BPi_1)
    const Ii_1 = listBPi[i + 1].I
    console.log('🚀 ~ file: data.js ~ line 283 ~ $ ~ Ii_1', Ii_1)

    const I_difference = Ii_1 - Ii
    const BPi_difference = BPi_1 - BPi

    const quotient = I_difference / BPi_difference
    const NowcastMinusBPi = Nowcast - BPi
    console.log('🚀 ~ file: data.js ~ line 290 ~ $ ~ Nowcast', Nowcast)

    const AQI = quotient * NowcastMinusBPi + Ii

    return AQI
  }

  const checkAirQuality = (AQI) => {
    if (AQI >= 0 || AQI <= 50) {
      document.getElementById('AQI_pm25').innerHTML = `${AQI} (Tốt)`
      document.getElementById('AQI_pm25').style.color = 'rgb(0,228,0)'
    }
    if (AQI >= 51 || AQI <= 100) {
      document.getElementById('AQI_pm25').innerHTML = `${AQI} (Trung Bình)`
      document.getElementById('AQI_pm25').style.color = 'rgb(255,255,0)'
    }
    if (AQI >= 101 || AQI <= 150) {
      document.getElementById('AQI_pm25').innerHTML = `${AQI} (Kém)`
      document.getElementById('AQI_pm25').style.color = 'rgb(255,126,0)'
    }
    if (AQI >= 151 || AQI <= 200) {
      document.getElementById('AQI_pm25').innerHTML = `${AQI} (Xấu)`
      document.getElementById('AQI_pm25').style.color = 'rgb(255,0,0)'
    }
    if (AQI >= 201 || AQI <= 300) {
      document.getElementById('AQI_pm25').innerHTML = `${AQI} (Rất xấu)`
      document.getElementById('AQI_pm25').style.color = 'rgb(143,63,151)'
    }
    if (AQI >= 301 || AQI <= 500) {
      document.getElementById('AQI_pm25').innerHTML = `${AQI} (Nguy hại)`
      document.getElementById('AQI_pm25').style.color = 'rgb(126,0,35)'
    }
  }

  // mess code
  formatDate(res1.feeds)
  formatDate(res2.feeds)
  formatDate(res3.feeds)
  formatDate(res4.feeds)
  formatDate(res5.feeds)
  formatDate(res6.feeds)

  fixNullFirstRecord(res1.feeds)
  fixNullFirstRecord(res2.feeds)
  fixNullFirstRecord(res3.feeds)
  fixNullFirstRecord(res4.feeds)
  fixNullFirstRecord(res5.feeds)
  fixNullFirstRecord(res6.feeds)

  fillFields(res1.feeds)
  fillFields(res2.feeds)
  fillFields(res3.feeds)
  fillFields(res4.feeds)
  fillFields(res5.feeds)
  fillFields(res6.feeds)

  const final1 = removeSameJson(res1.feeds)
  const final2 = removeSameJson(res2.feeds)
  const final3 = removeSameJson(res3.feeds)
  const final4 = removeSameJson(res4.feeds)
  const final5 = removeSameJson(res5.feeds)
  const final6 = removeSameJson(res6.feeds)

  var mergeData = [
    ...final1,
    ...final2,
    ...final3,
    ...final4,
    ...final5,
    ...final6,
  ]
  const consistentMerge = consistentJson(mergeData)
  const uniqueMerge = removeSameJson(consistentMerge)
  const trimMerge = trimJson(uniqueMerge)

  const PM25_listMax = PM25_findIndexPerHour(trimMerge)
  const PM25_W = PM25_W_calc(PM25_listMax)
  const PM25_w = PM25_w_calc(PM25_W)
  const PM25_Nowcast = PM25_Nowcast_calc(PM25_listMax, PM25_w)
  const PM25_i = PM25_indexBPi_calc(PM25_Nowcast)
  const PM25_AQI = PM25_AQI_calc(PM25_Nowcast, PM25_i)
  checkAirQuality(PM25_AQI)

  //UI
  const pm25 = final1[final1.length - 1].field1
  const pm10 = final2[final2.length - 1].field2
  const temperture = final3[final3.length - 1].field3
  const airHumidity = final4[final4.length - 1].field4
  const latitude = final5[final5.length - 1].field5
  const longitude = final6[final6.length - 1].field6

  document.getElementById('pm25').innerHTML = pm25
  document.getElementById('pm10').innerHTML = pm10
  document.getElementById('temperature').innerHTML = temperture
  document.getElementById('pressure').innerHTML = airHumidity

  $('#data').html(``)
  $.each(trimMerge, (index, value) => {
    var { created_at, field1, field2, field3, field4, field5, field6 } = value

    var html = `<tr>
                    <td>${created_at}</td>
                    <td>${field1 ? field1 : ''}</td>
                    <td>${field2 ? field2 : ''}</td>
                    <td>${field3 ? field3 : ''}</td>
                    <td>${field4 ? field4 : ''}</td>
                    <td>${field5 ? field5 : 'error'}</td>
                    <td>${field6 ? field6 : 'error'}</td>
                    <td>
                      <a style='display:${
                        field5 === 'nan' || field6 === 'nan' ? 'none' : 'block'
                      }' href='https://www.google.com/maps/place/${field5}+${field6}' target='_blank'>
                      https://www.google.com/maps/place/${field5}+${field6}
                      </a>
                      ${field5 === 'nan' || field6 === 'nan' ? 'unknown' : ''}
                    </td>
                </tr>`
    $('#data').prepend(html)
  })

  const pm25s = trimMerge.map((a) => Number(a.field1))
  const pm10s = trimMerge.map((a) => Number(a.field2))
  const temperatures = trimMerge.map((a) => Number(a.field3))
  const airHumidities = trimMerge.map((a) => Number(a.field4))
  const dates = trimMerge.map((a) => a.created_at)

  await new Chart('mutilplelinesChart', {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        { label: 'PM2.5', data: pm25s, borderColor: 'gray', fill: false },
        {
          label: 'PM10',
          data: pm10s,
          borderColor: 'black',
          fill: false,
        },
        {
          label: 'Tempurature',
          data: temperatures,
          borderColor: 'red',
          fill: false,
        },
        {
          label: 'Air Humidity',
          data: airHumidities,
          borderColor: 'blue',
          fill: false,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Multiple lines chart',
      },
      // labels: ['PM2.5', 'PM10', 'Temperature', 'Pressure'],
      // legend: {
      //   display: true,
      //   legendText: ['PM2.5', 'PM10', 'Temperature', 'Pressure'],
      // },
    },
  })

  // #############################################################
  var xValues = ['PM2.5', 'PM10', 'Temperature', 'Air Humidity']
  var yValues = [pm25, pm10, temperture, airHumidity]
  var barColors = [
    'gray',
    'black',
    'red',
    'blue',
    // "#1e7145"
  ]

  await new Chart('doughnutChart', {
    type: 'doughnut',
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: barColors,
          data: yValues,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Doughnut chart',
      },
    },
  })

  //print
  console.log('API 1: ')
  console.log('🚀 ~ file: data.js ~ line 20 ~ $ ~ res1.feeds', res1.feeds)
  console.log('API 2: ')
  console.log('🚀 ~ file: data.js ~ line 22 ~ $ ~ res2.feeds', res2.feeds)
  console.log('API 3: ')
  console.log('🚀 ~ file: data.js ~ line 24 ~ $ ~ res3.feeds', res3.feeds)
  console.log('API 4: ')
  console.log('🚀 ~ file: data.js ~ line 26 ~ $ ~ res4.feeds', res4.feeds)
  console.log('API 5: ')
  console.log('🚀 ~ file: data.js ~ line 26 ~ $ ~ res5.feeds', res5.feeds)
  console.log('API 6: ')
  console.log('🚀 ~ file: data.js ~ line 26 ~ $ ~ res6.feeds', res6.feeds)

  console.log('🚀 ~ file: data.js ~ line 354~ $ ~ final1', final1)
  console.log('🚀 ~ file: data.js ~ line 35 ~ $ ~ final2', final2)
  console.log('🚀 ~ file: data.js ~ line 35 ~ $ ~ final3', final3)
  console.log('🚀 ~ file: data.js ~ line 35 ~ $ ~ final4', final4)
  console.log('🚀 ~ file: data.js ~ line 35 ~ $ ~ final5', final5)
  console.log('🚀 ~ file: data.js ~ line 35 ~ $ ~ final6', final6)

  console.log('🚀 ~ file: data.js ~ line 125 ~ $ ~ mergeData', mergeData)
  console.log(
    '🚀 ~ file: data.js ~ line 145 ~ $ ~ consistentMerge',
    consistentMerge,
  )
  console.log('🚀 ~ file: data.js ~ line 145 ~ $ ~ uniqueMerge', uniqueMerge)
  console.log('🚀 ~ file: data.js ~ line 200 ~ $ ~ trimForceMerge', trimMerge)
  console.log('🚀 ~ file: data.js ~ line 248 ~ $ ~ ListBPi', listBPi)
  console.log('🚀 ~ file: data.js ~ line 293 ~ $ ~ PM25_listMax', PM25_listMax)
  console.log('🚀 ~ file: data.js ~ line 248 ~ $ ~ PM25_W', PM25_W)
  console.log('🚀 ~ file: data.js ~ line 248 ~ $ ~ PM25_w', PM25_w)
  console.log('🚀 ~ file: data.js ~ line 248 ~ $ ~ PM25_Nowcast', PM25_Nowcast)
  console.log('🚀 ~ file: data.js ~ line 248 ~ $ ~ PM25_i', PM25_i)
  console.log('🚀 ~ file: data.js ~ line 248 ~ $ ~ PM25_AQI', PM25_AQI)

  // console.log('🚀 ~ file: data.js ~ line 248 ~ $ ~ w', w)
  // console.log('🚀 ~ file: data.js ~ line 248 ~ $ ~ w', w)
})
