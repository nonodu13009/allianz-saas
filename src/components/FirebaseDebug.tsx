"use client"

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function FirebaseDebug() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        console.log('🔍 Test de connexion Firebase...')
        
        // Test avec un document simple
        const testDoc = doc(db, 'test', 'connection')
        const docSnap = await getDoc(testDoc)
        
        setStatus('success')
        setDetails({
          exists: docSnap.exists(),
          data: docSnap.exists() ? docSnap.data() : null,
          id: docSnap.id
        })
        
        console.log('✅ Connexion Firebase réussie')
        
      } catch (err: any) {
        console.error('❌ Erreur Firebase:', err)
        setStatus('error')
        setError(err.message)
        setDetails({
          code: err.code,
          message: err.message,
          stack: err.stack
        })
      }
    }

    testFirebaseConnection()
  }, [])

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">🔍 Diagnostic Firebase</h3>
      
      {status === 'loading' && (
        <div className="text-blue-600">🔄 Test de connexion en cours...</div>
      )}
      
      {status === 'success' && (
        <div className="text-green-600">
          ✅ Connexion Firebase réussie
          <pre className="mt-2 text-xs bg-white p-2 rounded border">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600">
          ❌ Erreur Firebase: {error}
          <pre className="mt-2 text-xs bg-white p-2 rounded border">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
