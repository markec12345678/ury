import { call } from './frappe-sdk-retry';
import { getErrorMessage } from './error-utils';

export interface POSCloseValidationResponse {
  message: string;
}

export const checkPOSOpening = async (): Promise<number> => {
  try {
    const response = await call.get<{ message: number }>(
      'ury.ury_pos.api.posOpening'
    );
    
    return response.message;
  } catch (error) {
    throw new Error(`Failed to check POS opening status: ${getErrorMessage(error)}`, { cause: error });
  }
};

export const validatePOSClose = async (posProfile: string): Promise<POSCloseValidationResponse> => {
  try {
    const response = await call.get<POSCloseValidationResponse>(
      'ury.ury_pos.api.validate_pos_close',
      {
        pos_profile: posProfile
      }
    );
    
    return response;
  } catch (error) {
    throw new Error(`Failed to validate POS close status: ${getErrorMessage(error)}`, { cause: error });
  }
}; 