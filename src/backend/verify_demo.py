import httpx

def main():
    print("=== CyberSentinel End-to-End System Verification ===")
    
    # 1. Health
    r_health = httpx.get('http://127.0.0.1:8000/api/health')
    print('1. Health Check:', r_health.status_code, r_health.json())
    assert r_health.status_code == 200

    # 2. Dashboard
    r_dash = httpx.get('http://127.0.0.1:8000/api/dashboard')
    dash = r_dash.json()
    print('2. Dashboard KPIs:', dash['kpi'])
    print('   System Status:', dash['system_status'])
    assert dash['kpi']['critical_incidents'] >= 1

    # Reset to clean seed state
    httpx.post('http://127.0.0.1:8000/api/simulation/reset')

    # 3. Simulate Full Attack
    print('\n3. Triggering Primary Demo Attack Chain Simulation...')
    r_sim = httpx.post('http://127.0.0.1:8000/api/simulation/full-attack')
    assert r_sim.status_code == 200
    sim = r_sim.json()
    inc = sim['incident']
    print(f"   Simulation: {sim['simulation_name']}")
    print(f"   Generated Incident ID: {inc['id']}")
    print(f"   Title: {inc['title']}")
    print(f"   Severity: {inc['severity']}")
    print(f"   Risk Score: {inc['risk_score']} / 100")
    print(f"   AI Confidence: {inc['confidence']}%")
    print(f"   Events Correlated: {len(inc['events'])}")
    print(f"   Steps Count: {len(sim['steps'])}")
    print("   Risk Factors Breakdown:")
    for rf in inc['risk_factors']:
        print(f"     + {rf['indicator']} (+{rf['contribution']} pts): {rf['evidence']}")
    
    assert inc['severity'] == "CRITICAL"
    assert inc['risk_score'] >= 90
    assert len(inc['events']) >= 9

    # 4. AI SOC Chat
    print('\n4. Testing Evidence-Grounded AI SOC Chat...')
    q = "Why is this incident critical?"
    r_chat = httpx.post(f"http://127.0.0.1:8000/api/incidents/{inc['id']}/chat", json={'message': q})
    assert r_chat.status_code == 200
    chat = r_chat.json()
    print(f"   Analyst Question: '{q}'")
    print(f"   CyberSentinel Reply:\n   {chat['reply']}")

    # 5. Incident Report
    print('\n5. Testing Incident Report Generation...')
    r_rep = httpx.post(f"http://127.0.0.1:8000/api/incidents/{inc['id']}/report")
    assert r_rep.status_code == 200
    rep = r_rep.json()
    print(f"   Report Title: {rep['title']}")
    print("   Generated Markdown Snippet:")
    for line in rep['markdown'].splitlines()[:10]:
        print("   " + line)

    # 6. Frontend Dev Server Check
    print('\n6. Checking Frontend Command Center...')
    r_fe = httpx.get('http://127.0.0.1:5173')
    print('   Frontend Server Status:', r_fe.status_code)
    assert r_fe.status_code == 200
    assert "CyberSentinel" in r_fe.text or "doctype html" in r_fe.text.lower()

    print('\n=== ALL VERIFICATION CHECKS PASSED PERFECTLY ===')

if __name__ == '__main__':
    main()
