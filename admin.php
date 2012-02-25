<?php
/**
* ownCloud shorty plugin, a URL shortener
*
* @author Christian Reiner
* @copyright 2011-2012 Christian Reiner <foss@christian-reiner.info>
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the license, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.
* If not, see <http://www.gnu.org/licenses/>.
*
*/

// Check if we are a user
OC_Util::checkAdminUser ( );
OC_Util::checkAppEnabled ( 'shorty' );

OC_Util::addStyle  ( 'shorty', 'admin' );
OC_Util::addScript ( 'shorty', 'admin' );

OC_Util::addStyle  ( '3rdparty', 'chosen/chosen' );
OC_Util::addScript ( '3rdparty', 'chosen/chosen.jquery.min' );

// fetch template
$tmpl = new OC_Template ( 'shorty', 'tmpl_admin' );
// inflate template
$tmpl->assign ( 'backend-static-base-system', OC_Appconfig::getValue('shorty','backend-static-base-system','') );
// render template
return $tmpl->fetchPage ( );
?>