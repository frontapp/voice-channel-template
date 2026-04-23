import {useState} from 'react';
import Front, {EntryPointNotificationTypesEnum} from '@frontapp/plugin-sdk';

interface CallerIdentity {
  name: string
  phoneNumber: string
}

interface CallingContext {
  displayCallNotification(caller: CallerIdentity): Promise<void>;
  dismissCallNotification(notificationId: string): void;
}

function App() {

  const [notificationId, setNotificationId] = useState<string>();
  const [callingContext, setCallingContext] = useState<CallingContext>();

  Front.contextUpdates.subscribe((contextUpdates) => {
    // Get the Front teammate from the Plugin SDK context
    const {teammate} = contextUpdates;

    const isAppropriateContext = contextUpdates.type === 'singleConversation' || contextUpdates.type === 'noConversation' || contextUpdates.type === 'multiConversations';
    if (!isAppropriateContext) {
      return;
    }

    // Light wrapper to expose a simplified contract 
    setCallingContext({
        displayCallNotification: async (callerIdentity) => {
          /* If you only want to display the notification to a specific user, you can compare the user logged into your voice 
          call provider to the email address of the Front teammate in the Front context. To complete this code, add logic for
          identifying the user that has logged into your voice call provider through the plugin and then compare the user's email
          address to the one provided by the Front context in teammate.email */
           
          // if (voiceProviderUser.email !== teammate.email) {
          //   return null;
          // }

          const {name, phoneNumber} = callerIdentity;

          // Returns an ID that can be used to programmatically dismiss if needed.
          const notifId = await contextUpdates.displayNotification({
            type: EntryPointNotificationTypesEnum.INCOMING_CALL,
            contact: {
              name,
              // handle is expected to be the phone number of the caller
              handle: phoneNumber
            }
          });
          setNotificationId(notifId);
          return;
        },
        dismissCallNotification: contextUpdates.dismissNotification
      });
  })

  /**
   * When you detect that a user is receiving a call, you can call this function
   * to notify the user from Front.
   */
  const onCallRinging = (callerIdentity: CallerIdentity) => {
    callingContext?.displayCallNotification(callerIdentity);
  }

  /** 
   * When the ringing ends (or whenever else you deem appropriate), you can call this function
   * to close the notification without user interaction.
   */
  const onCallRingingEnded = () => {
    if (!notificationId) {
      return;
    }

    callingContext?.dismissCallNotification(notificationId);
    setNotificationId(undefined);
  }

  return (
    <div>Render your voice calls here.</div>
  )
}

export default App;