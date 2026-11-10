package org.heartfeltonline.community;

import android.os.Bundle;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Personal information on screen: no screenshots, no screen recording, and a blank preview in the recent-apps list.
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
    }
}
