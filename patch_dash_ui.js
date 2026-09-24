const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/DashboardClient.tsx', 'utf8');

const regex = /<span className=\"text-sm font-medium text-gray-700\">Status:<\/span>[\s\S]*?\{waStatus\.connectionState === "open" \? \([\s\S]*?\n\s*\) : \(/;

const correctUI = \
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    {waStatus.connectionState === "open" ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Disconnected
                      </div>
                    )}
                  </div>
                  
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

code = code.replace(regex, correctUI.trim());
fs.writeFileSync('src/app/dashboard/DashboardClient.tsx', code);
