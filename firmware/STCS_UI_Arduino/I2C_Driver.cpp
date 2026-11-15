#include "I2C_Driver.h"
static SemaphoreHandle_t bus_mutex=nullptr;
void STCS_I2C_Lock(){if(bus_mutex)xSemaphoreTakeRecursive(bus_mutex,portMAX_DELAY);}
void STCS_I2C_Unlock(){if(bus_mutex)xSemaphoreGiveRecursive(bus_mutex);}


void I2C_Init(void) {
  bus_mutex=xSemaphoreCreateRecursiveMutex();
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
}

bool I2C_Read(uint8_t Driver_addr, uint8_t Reg_addr, uint8_t *Reg_data, uint32_t Length)
{
  STCS_I2C_Guard guard;
  Wire.beginTransmission(Driver_addr);
  Wire.write(Reg_addr);
  if ( Wire.endTransmission(true)){
    printf("The I2C transmission fails. - I2C Read\r\n");
    return -1;
  }
  Wire.requestFrom(Driver_addr, Length);
  for (int i = 0; i < Length; i++) {
    *Reg_data++ = Wire.read();
  }
  return 0;
}
bool I2C_Write(uint8_t Driver_addr, uint8_t Reg_addr, const uint8_t *Reg_data, uint32_t Length)
{
  STCS_I2C_Guard guard;
  Wire.beginTransmission(Driver_addr);
  Wire.write(Reg_addr);
  for (int i = 0; i < Length; i++) {
    Wire.write(*Reg_data++);
  }
  if ( Wire.endTransmission(true))
  {
    printf("The I2C transmission fails. - I2C Write\r\n");
    return -1;
  }
  return 0;
}
