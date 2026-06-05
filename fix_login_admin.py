content = open('src/App.jsx').read()

old = """    // Check groomers by name
    const groomerByName = groomers.find(g => g.name.toLowerCase() === val.toLowerCase());
    if (groomerByName) {
      setMatchedUser(groomerByName);
      setStep('pin');
      setPinInput('');
      return;
    }
    setError('User not found');"""

new = """    // Check groomers by name
    const groomerByName = groomers.find(g => g.name.toLowerCase() === val.toLowerCase());
    if (groomerByName) {
      setMatchedUser(groomerByName);
      setStep('pin');
      setPinInput('');
      return;
    }
    // Check admin/manager users by name
    const adminUser = users.find(u => u.name.toLowerCase() === val.toLowerCase() && (u.role === 'admin' || u.role === 'manager'));
    if (adminUser) {
      setMatchedUser({...adminUser, pin: String(adminUser.pin), companyId: adminUser.companyId || 'epw'});
      setStep('pin');
      setPinInput('');
      return;
    }
    setError('User not found');"""

if old in content:
    content = content.replace(old, new)
    print("OK")
else:
    print("NO ENCONTRADO")

open('src/App.jsx', 'w').write(content)