const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/DashboardClient.tsx', 'utf8');

// Update state definition if needed, though typescript doesn't need strictly typing here since it's any initialized
code = code.replace(/setWaStatus\(\{ isConnected: false, qr: null \}\)/, 'setWaStatus({ isConnected: false, connectionState: "offline", qr: null, groups: [], activeGroupId: null })');
code = code.replace(/const \[waStatus, setWaStatus\] = useState\(\{ isConnected: false, qr: null \}\);/, 'const [waStatus, setWaStatus] = useState<any>({ isConnected: false, connectionState: "offline", qr: null, groups: [], activeGroupId: null });\n  const [isSavingGroup, setIsSavingGroup] = useState(false);');

// Handle set group
const setGroupFn = \
  const handleSetGroup = async (groupId: string) => {
    setIsSavingGroup(true);
    try {
      const res = await fetch('/api/whatsapp/set-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });
      const data = await res.json();
      if(data.success) {
        setWaStatus({...waStatus, activeGroupId: data.activeGroupId});
      }
    } catch(e) {
      console.error(e);
    }
    setIsSavingGroup(false);
  };
\;
code = code.replace(/const handleWaLogout = async \(\) => \{/, setGroupFn + '\n  const handleWaLogout = async () => {');

// Update fetch to proxy
code = code.replace(/const baseUrl = process\.env\.NEXT_PUBLIC_APP_URL[^;]*;/, '');
code = code.replace(/await fetch\(\\\\$\{baseUrl\}\/api\/whatsapp\/status\\);/, 'await fetch(\/api/whatsapp/status\);');

code = code.replace(/const baseUrl = process\.env\.NEXT_PUBLIC_APP_URL[^;]*;/, '');
code = code.replace(/await fetch\(\\\\$\{baseUrl\}\/api\/whatsapp\/logout\/, 'await fetch(\/api/whatsapp/logout\');

// Update UI condition for connected
code = code.replace(/waStatus\.isConnected \? \(/, 'waStatus.connectionState === "open" ? (');
code = code.replace(/waStatus\.isConnected \? \(/, 'waStatus.connectionState === "open" ? (');

// Add the group selector dropdown to UI
const groupSelectorUI = \
                  {waStatus.connectionState === "open" ? (
                    <div className="space-y-4">
                      <button onClick={handleWaLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
                        Disconnect
                      </button>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notification Group</label>
                        <select 
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                          value={waStatus.activeGroupId || ''}
                          onChange={(e) => handleSetGroup(e.target.value)}
                          disabled={isSavingGroup}
                        >
                          <option value="">-- Select a WhatsApp Group --</option>
                          {waStatus.groups?.map((g: any) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select the group where tickets will be broadcasted to your admins.</p>
                      </div>
                    </div>
                  ) : (
\;

code = code.replace(/\{waStatus\.connectionState === "open" \? \([\s\S]*?<\/button>\n\s*\) : \(/, groupSelectorUI);

fs.writeFileSync('src/app/dashboard/DashboardClient.tsx', code);
