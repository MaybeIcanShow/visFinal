const minDate = "2023-07-01";
      const maxDate = "2023-07-31";
      console.log(new Date('2023-07-04').getTime());

      const fp = flatpickr("#datepicker", {
        minDate: minDate,
        maxDate: maxDate,
      });
      const date = document.getElementById("datepicker");
      const timeRange = document.getElementById("timeRange"); // input range 时间轴
      const weekElement = document.getElementById("week"); // 刻度
      const spans = weekElement.querySelectorAll("span");
      const tooltip = document.getElementById("tooltip");  // 气泡
      const inputElement = new Event("input", {
        // 触发事件
        bubbles: true, // 可冒泡
        cancelable: true, // 可取消
      });

      // timeRange.min = new Date(minDate).getTime();
      // timeRange.max = new Date(maxDate).getTime();
      // timeRange.value =

      // -------------------------------------------------------------------------------

      // 监听日历输入
      date.addEventListener("input", function () {
        currentDate = new Date(date.value);
        // dayOfWeek = currentDate.getUTCDay();
        firstDateOfWeek = currentDate - 3 * 86400000;
        
        // 更新时间轴
        timeRange.min = firstDateOfWeek;
        timeRange.max = firstDateOfWeek + 604800000;
        timeRange.value = currentDate.getTime();

        for (var i = 0; i < spans.length; i++) {
          var tempTimestamp = new Date(firstDateOfWeek + i * 86400000);
          spans[i].textContent = `${(tempTimestamp.getUTCMonth() + 1).toString().padStart(2, "0")}-${tempTimestamp.getUTCDate().toString().padStart(2, "0")}`;
        }
        timeRange.dispatchEvent(inputElement);
      });

      // ---------------------------------------------------------------------------------

      // 监听时间轴变化
      timeRange.addEventListener("input", function () {
        // 更新日历
        currentDate = new Date(parseInt(timeRange.value));
        dateString = currentDate.toISOString().split("T")[0];
        date.value = dateString;

        // 更新气泡
        var tempTimestamp = new Date(parseInt(timeRange.value))
          tooltip.textContent = ` 
          ${tempTimestamp.getUTCFullYear()}年
          ${(tempTimestamp.getUTCMonth() + 1).toString().padStart(2, "0")}月
          ${tempTimestamp.getUTCDate().toString().padStart(2, "0")}日
          ${tempTimestamp.getUTCHours().toString().padStart(2, "0")}时`;
          positionTooltip();
        //更新地图
          var tempDate = {
              'year': tempTimestamp.getUTCFullYear(),
              'month': tempTimestamp.getUTCMonth() + 1,
              'day': tempTimestamp.getUTCDate(),
              'time': tempTimestamp.getUTCHours()
          }
          updateMap(varName, isVector, tempDate);
        // updateMap(dateString.split("-")[0] +dateString.split("-")[1] + dateString.split("-")[2], currentDate.getUTCHours().toString().padStart(2, "0"));
      });

      function positionTooltip() {
          const thumbWidth = 20;
          const percent =
            (timeRange.value - timeRange.min) /
            (timeRange.max - timeRange.min);
          const thumbPosition = percent * (timeRange.offsetWidth - thumbWidth);
          const tooltipLeft = thumbPosition + thumbWidth / 2;
          tooltip.style.left = `${tooltipLeft}px`;
          tooltip.style.display = "block";
          tooltip.style.opacity = 1;
        }