/*Using LVGL with Arduino requires some extra steps:
 *Be sure to read the docs here: https://docs.lvgl.io/master/get-started/platforms/arduino.html  */

#include "Display_SPD2010.h"
#include "Audio_PCM5101.h"
#include "RTC_PCF85063.h"
#include "Gyro_QMI8658.h"
#include "LVGL_Driver.h"
#include "MIC_MSM.h"
#include "PWR_Key.h"
#include "SD_Card.h"
#include "LVGL_Example.h"
#include "BAT_Driver.h"
#include "STCS_AudioStorage.h"
#include "STCS_Network.h"
#include "STCS_UI.h"


void Driver_Loop(void *parameter)
{
  while(1)
  {
    PWR_Loop();
    QMI8658_Loop();
    PCF85063_Loop();
    BAT_Get_Volts();
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}
void Driver_Init()
{
  Flash_test();
  PWR_Init();
  BAT_Init();
  I2C_Init();
  TCA9554PWR_Init(0x00);
  Backlight_Init();
  Set_Backlight(50);      //0~100
  PCF85063_Init();
  QMI8658_Init();

}
void setup()
{
  Serial.begin(115200);
  Driver_Init();

  STCS_AudioStorage_Init();
  Audio_Init();
  Volume_adjustment(15);

  LCD_Init();
  Lvgl_Init();

  STCS_UI_Init();
  STCS_Network_Init();

  xTaskCreatePinnedToCore(
    Driver_Loop,
    "Other Driver task",
    2048,
    NULL,
    3,
    NULL,
    0
  );
}
void loop() {
  Lvgl_Loop();
  STCS_Audio_Loop();
  STCS_Network_Loop();

  static StcsBoardConfig board_config;
  if (STCS_Network_TakeBoardConfig(&board_config)) {
    STCS_UI_ApplyBoardConfig(&board_config);
  }
  vTaskDelay(pdMS_TO_TICKS(5));

}
