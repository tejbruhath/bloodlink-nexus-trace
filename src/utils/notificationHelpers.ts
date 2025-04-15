import { NotificationType } from '@/lib/types';

// Function to generate a test notification
export const generateTestNotification = (addNotificationFn: (title: string, message: string, type: NotificationType, link?: string) => void) => {
  const types: NotificationType[] = ['info', 'success', 'warning', 'error'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  const subjects = ['Blood donation', 'Inventory update', 'Transfusion', 'Database sync', 'Patient'];
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
  
  const actions = ['completed', 'failed', 'updated', 'scheduled', 'canceled'];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  
  const title = `${randomSubject} ${randomAction}`;
  const message = `A ${randomSubject.toLowerCase()} has been ${randomAction} at ${new Date().toLocaleTimeString()}`;
  
  addNotificationFn(title, message, randomType);
};

// Function to monitor database table changes
export const monitorTableChange = (
  addNotificationFn: (title: string, message: string, type: NotificationType, link?: string) => void,
  tableName: string, 
  changeType: 'added' | 'updated' | 'deleted', 
  itemName: string,
  itemId: string,
  details?: string
) => {
  let title = '';
  let message = '';
  let type: NotificationType = 'info';
  let link = '/';
  
  switch (tableName) {
    case 'donors':
      title = `Donor ${changeType}`;
      message = `Donor ${itemName} has been ${changeType} (ID: ${itemId})${details ? `: ${details}` : ''}`;
      type = changeType === 'added' ? 'success' : changeType === 'deleted' ? 'warning' : 'info';
      link = '/donors';
      break;
      
    case 'blood_inventory':
      title = `Inventory ${changeType}`;
      message = `Blood unit ${itemId} has been ${changeType}${details ? `: ${details}` : ''}`;
      type = changeType === 'deleted' ? 'warning' : 'info';
      link = '/inventory';
      break;
      
    case 'blood_requests':
      title = `Request ${changeType}`;
      message = `Blood request for ${itemName} has been ${changeType} (ID: ${itemId})${details ? `: ${details}` : ''}`;
      type = changeType === 'added' ? 'success' : 'info';
      link = '/recipients';
      break;
      
    default:
      title = `${tableName} ${changeType}`;
      message = `An item in ${tableName} has been ${changeType} (ID: ${itemId})${details ? `: ${details}` : ''}`;
  }
  
  addNotificationFn(title, message, type, link);
}; 