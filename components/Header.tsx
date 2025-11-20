/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useUI } from '@/lib/state';

export default function Header() {
  const { toggleSidebar } = useUI();

  return (
    <header>
      <div className="header-left">
        <h1></h1>
        <p></p>
        <p></p>
      </div>
      <div className="header-right">
        
      </div>
    </header>
  );
}