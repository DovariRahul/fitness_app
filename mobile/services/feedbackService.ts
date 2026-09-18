import api from './api';
import { FeedbackData } from '../types';

export const feedbackService = {
  async submitFeedback(data: FeedbackData): Promise<any> {
    return api.post('/feedback', data);
  },

  async getFeedbackHistory(): Promise<any[]> {
    return api.get<any[]>('/feedback');
  },
};

export default feedbackService;
